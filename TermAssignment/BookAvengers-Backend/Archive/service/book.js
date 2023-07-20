const AWS = require('aws-sdk');
const jwt= require('jsonwebtoken');

AWS.config.update({region: 'us-east-1'});
const util = require ('../utils/util');
const auth = require ('../utils/auth');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'bookavengers-books';
const sns = new AWS.SNS();
const getBook = async (id, token) => {
    try {
        console.log('Token received:', token);

        // Extract the email from the token dynamically
        const decodedToken = jwt.decode(token.split(' ')[1]);
        const email = decodedToken.email;
        console.log('Email associated with the token:', email);

        if (!email) {
            return util.buildResponse(401, { message: 'Invalid token or missing email.' });
        }

        // Assuming the email is available in the verification result
        const book = await fetchBookById(id);

        // Check if the book exists and is associated with the user's email
        if (!book || book.email !== email) {
            return util.buildResponse(404, { message: 'Book not found or unauthorized access.' });
        }
        const snsMessage = `User " ${email} " has added a new book to the library`;
        publishSNSMessage(snsMessage);
        return util.buildResponse(200, book);
    } catch (error) {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
        return util.buildResponse(500, { message: 'An error occurred while fetching the book.' });
    }
};

const getBooks = async (token) => {
    try {
        console.log('Token received:', token);

        // Extract the email from the token dynamically
        const decodedToken = jwt.decode(token.split(' ')[1]);
        const email = decodedToken.email;
        console.log('Email associated with the token:', email);

        if (!email) {
            return util.buildResponse(401, { message: 'Invalid token or missing email.' });
        }

        const verification = await auth.verifyToken(email, token.split(' ')[1]);

        if (!verification.verified) {
            return util.buildResponse(401, { message: 'Invalid token.' });
        }

        const params = {
            TableName: dynamodbTableName,
        };
        const allBooks = await scanDynamoRecords(params, []);

        // Filter books to only include those associated with the user's email
        const userBooks = allBooks.filter((book) => book.email === email);

        const body = {
            books: userBooks,
        };
        return util.buildResponse(200, body);
    } catch (error) {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
        return util.buildResponse(500, { message: 'An error occurred while fetching the books.' });
    }
};

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
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
    }
}


async function saveBook(requestBody, token) {

    try {
        console.log('Token received:', token);

        // Extract the email from the token dynamically
        const decodedToken = jwt.decode(token.split(' ')[1]);
        const email = decodedToken.email;
        console.log('Email associated with the token:', email);

        if (!email) {
            return util.buildResponse(401, { message: 'Invalid token or missing email.' });
        }

        const verification = await auth.verifyToken(email, token.split(' ')[1]);

        if (!verification.verified) {
            return util.buildResponse(401, { message: 'Invalid token.' });
        }

        const bookId = generateUniqueId();
        const book = {
            id: bookId,
            ...requestBody,
            email: verification.email
        };

        const params = {
            TableName: dynamodbTableName,
            Item: book,
        };

        await dynamodb.put(params).promise();

        const body = {
            Operation: 'SAVE',
            Message: 'SUCCESS',
            Item: book,
        };
        const snsMessage = `User ${email} has added a new book ${book.name} to the library`;
        publishSNSMessage(snsMessage);
        return util.buildResponse(200, body);
    } catch (error) {
        console.error('Error adding book:', error);
        // Handle error if necessary
        return util.buildResponse(500, { message: 'An error occurred while adding the book.' });
    }
}

async function modifyBook(id, updateKey, updateValue, token) {

    console.log('Token received:', token);

    // Extract the email from the token dynamically
    const decodedToken = jwt.decode(token.split(' ')[1]);
    const email = decodedToken.email;
    console.log('Email associated with the token:', email);

    if (!email) {
        return util.buildResponse(401, { message: 'Invalid token or missing email.' });
    }

    const verification = await auth.verifyToken(email, token.split(' ')[1]);

    if (!verification.verified) {
        return util.buildResponse(401, { message: 'Invalid token.' });
    }

    const params = {
        TableName: dynamodbTableName,
        Key: {
            id: id
        },
        UpdateExpression: `set #status = :value`, // Use expression attribute name for "status"
        ExpressionAttributeNames: {
            '#status': 'status' // Define the attribute name mapping
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
        return util.buildResponse(200, body);
    })
    .catch((error) => {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
    });
}

async function deleteBook(id, token) {

    console.log('Token received:', token);

    // Extract the email from the token dynamically
    const decodedToken = jwt.decode(token.split(' ')[1]);
    const email = decodedToken.email;
    console.log('Email associated with the token:', email);

    if (!email) {
        return util.buildResponse(401, { message: 'Invalid token or missing email.' });
    }

    const verification = await auth.verifyToken(email, token.split(' ')[1]);

    if (!verification.verified) {
        return util.buildResponse(401, { message: 'Invalid token.' });
    }

    const params = {
        TableName: dynamodbTableName,
        Key: {
            id: id
        },
        ReturnValues: 'ALL_OLD'
    };
    return await dynamodb
    .delete(params)
    .promise()
    .then((response) => {
        const body = {
            Operation: 'DELETE',
            Message: 'SUCCESS',
            Item: response
        };

        getBook(id).then((bookResponse) => {
            if (bookResponse && bookResponse.name) {
                const bookName = bookResponse.name;
                const snsMessage = `User ${email} has added a new book " ${bookName} " to the library`;
                publishSNSMessage(snsMessage);
            }
        });

        return util.buildResponse(200, body);
    })
    .catch((error) => {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
    });
}

const generateUniqueId = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return timestamp + randomPart;
};

function publishSNSMessage(message) {
    const params = {
        Message: message,
        TopicArn: 'arn:aws:sns:us-east-1:448001105130:LibraryNotificationsTopic' // Replace with the ARN of the "LibraryNotificationsTopic"
    };
    sns.publish(params, (err, data) => {
        if (err) {
            console.error('Error publishing SNS message:', err);
        } else {
            console.log('SNS message published:', data);
        }
    });
}

module.exports.getBook = getBook;
module.exports.getBooks = getBooks;
module.exports.saveBook = saveBook;
module.exports.modifyBook = modifyBook;
module.exports.deleteBook = deleteBook;