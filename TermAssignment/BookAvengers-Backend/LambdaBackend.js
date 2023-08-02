const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const healthPath = '/health';
const registerPath = '/register';
const loginPath = '/login';
const bookPath = '/book';
const booksPath = '/books';
const crypto = require('crypto');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = `${process.env.USER_TABLE_NAME}`;
const dynamodbTableName = `${process.env.BOOK_TABLE_NAME}`;
const sqs = new AWS.SQS();

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function register(userInfo) {
  const name = userInfo.name;
  const email = userInfo.email;
  const password = hashPassword(userInfo.password);
  if (!name || !email || !password) {
    return buildResponse(401,
      {
        message: 'All fields are required.'
      });
  }
  const dynamoUser = await getUser(email.trim());
  if (dynamoUser && dynamoUser.email) {
    return buildResponse(401, {
      message: 'User already exists'
    });
  }
  const user = {
    name: name,
    email: email.trim(),
    password: password
  };

  const saveUserresponse = await saveUser(user);
  if (!saveUserresponse) {
    return buildResponse(503, {
      message: 'Server error, Try later'
    });
  }
  return buildResponse(200, { email: email });
}
async function getUser(email) {
  const params = {
    TableName: userTable,
    Key: {
      email: email
    }
  };
  return await dynamodb.get(params).promise().then(response => {
    return response.Item;
  }, error => {
    console.error("There is an error while adding:", error);
  });
}
async function saveUser(user) {
  const params = {
    TableName: userTable,
    Item: user
  };
  return await dynamodb.put(params).promise().then(() => {
    return true;
  }, error => {
    console.error("There is an error while saving:", error);
  });
}


async function login(user) {
  const email = user.email;
  const password = hashPassword(user.password);
  if (!user || !email || !password) {
    return buildResponse(401, { message: 'username or password required' });
  }
  const dynamoUser = await getUser(email);
  if (!dynamoUser || !dynamoUser.email) {
    return buildResponse(403, { message: 'user does not exist' });
  }
  if (password !== dynamoUser.password) {
    return buildResponse(403, { message: 'password does not match' });
  }
  const userInfo = { email: dynamoUser.email, name: dynamoUser.name };
  return buildResponse(200, userInfo);
}

const getBook = async (id) => {
  try {
    const book = await fetchBookById(id);
    if (!book) {
      return buildResponse(404, { message: 'Book not found.' });
    }
    return buildResponse(200, book);
  } catch (error) {
    console.error('error: ', error);
    return buildResponse(500, { message: 'An error occurred while fetching the book.' });
  }
};

const getBooks = async () => {

  const params = {
    TableName: dynamodbTableName,
  };
  const allBooks = await scanDynamoRecords(params, []);

  const body = {
    books: allBooks,
  };
  return buildResponse(200, body);

};

async function saveBook(requestBody) {
  try {
    const bookId = generateUniqueId();
    const book = {
      id: bookId,
      ...requestBody,
    };

    const params = {
      TableName: dynamodbTableName,
      Item: book,
    };

    await dynamodb.put(params).promise();

    const sqsParams = {
      MessageBody: JSON.stringify({
        operation: 'save',
        email: requestBody.userEmail,
        book: book
      }),
      QueueUrl: `${process.env.SAVE_BOOK_QUEUE_URL}`,
    };

    await sqs.sendMessage(sqsParams).promise();

    const body = {
      Operation: 'SAVE',
      Message: 'SUCCESS',
      Item: book,
    };
    return buildResponse(200, body);
  } catch (error) {
    console.error('Error adding book:', error);
    return buildResponse(500, { message: 'An error occurred while adding the book.' });
  }
}

async function modifyBook(id, updateKey, updateValue) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      id: id
    },
    UpdateExpression: `set #status = :value`,
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':value': updateValue
    },
    ReturnValues: 'UPDATED_NEW'
  };

  return await dynamodb
    .update(params)
    .promise()
    .then((response) => {
      const body = {
        Operation: 'UPDATE',
        Message: 'SUCCESS',
        UpdatedAttributes: response
      };
      return buildResponse(200, body);
    })
    .catch((error) => {
      console.error('error: ', error);
    });
}

async function deleteBook(id, userEmail) {
  try {
    const paramsGet = {
      TableName: dynamodbTableName,
      Key: {
        id: id,
      },
    };

    const responseGet = await dynamodb.get(paramsGet).promise();
    const book = responseGet.Item;

    if (!book) {
      return buildResponse(404, { message: 'Book not found.' });
    }

    const paramsDelete = {
      TableName: dynamodbTableName,
      Key: {
        id: id,
      },
      ReturnValues: 'ALL_OLD'
    };

    const responseDelete = await dynamodb.delete(paramsDelete).promise();

    const sqsParams = {
      MessageBody: JSON.stringify({
        operation: 'delete',
        email: userEmail,
        bookId: id,
        bookName: book.name, 
      }),
      QueueUrl: `${process.env.DELETE_BOOK_QUEUE_URL}`,
    };

    await sqs.sendMessage(sqsParams).promise();

    const body = {
      Operation: 'DELETE',
      Message: 'SUCCESS',
      Item: responseDelete
    };

    return buildResponse(200, body);
  } catch (error) {
    console.error('error: ', error);
    return buildResponse(500, { message: 'An error occurred while deleting the book.' });
  }
}

async function fetchBookById(id) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      id: id,
    },
  };
  const response = await dynamodb.get(params).promise();
  return response.Item;
}

async function scanDynamoRecords(scanParams, itemArray) {
  try {
    const dynamoData = await dynamodb.scan(scanParams).promise();
    itemArray = itemArray.concat(dynamoData.Items);
    if (dynamoData.LastEvaluatedKey) {
      scanParams.ExclusiveStartkey = dynamoData.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, itemArray);
    }
    return itemArray;
  } catch (error) {
    console.error('error: ', error);
  }
}

const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return timestamp + randomPart;
};

exports.handler = async (event) => {
  console.log('Request Event: ', event);

  let response;

  switch (true) {
    case event.httpMethod === 'GET' && event.path === healthPath:
      response = buildResponse(200);
      break;

    case event.httpMethod === 'POST' && event.path === registerPath:
      const registerBody = JSON.parse(event.body);
      response = await register(registerBody);
      break;

    case event.httpMethod === 'POST' && event.path === loginPath:
      const loginBody = JSON.parse(event.body);
      response = await login(loginBody);
      break;

    case event.httpMethod === 'GET' && event.path === bookPath:
      response = await getBook(event.queryStringParameters.id);
      break;

    case event.httpMethod === 'GET' && event.path === booksPath:
      response = await getBooks();
      break;

    case event.httpMethod === 'POST' && event.path === bookPath:
      const requestBody = JSON.parse(event.body);
      console.log('Request Body:', requestBody);
      console.log(requestBody);
      response = await saveBook(requestBody);
      break;

    case event.httpMethod === 'PATCH' && event.path === bookPath:
      const patchRequestBody = JSON.parse(event.body);
      response = await modifyBook(patchRequestBody.id, patchRequestBody.updateKey, patchRequestBody.updateValue);
      break;


    case event.httpMethod === 'DELETE' && event.path === bookPath:
      const id = event.queryStringParameters.id;
      const userEmailDelete = event.queryStringParameters.userEmail;
      response = await deleteBook(id, userEmailDelete);
      break;

    default:
      response = buildResponse(404, '404 Not Found');
  }
  return response;
};