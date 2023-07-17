const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'bookavengers-users';
const util = require ('../utils/util');
const bcrypt = require('bcryptjs');

async function register(userInfo){
    const name = userInfo.name;
    const email = userInfo.email;
    const password = userInfo.password;
    if (!name || !email || !password){
        return util.buildResponse(401,
            {
                message: 'All fields are required.'
            });
    }
    const dynamoUser = await getUser(email.trim());
    if (dynamoUser && dynamoUser.email){
        return util.buildResponse( 401, {
            message: 'User already exists'
        });
    }
    const encryptpw = bcrypt.hashSync(password.trim());
    const user ={
        name: name,
        email: email.trim(),
        password: encryptpw
    };

    const saveUserresponse = await saveUser(user);
    if (!saveUserresponse ){
        return util.buildResponse(503, {
            message: 'Server error, Try later'
        });
    }
    return util.buildResponse(200, {email: email});
}
async function getUser(email){
    const params={
        TableName: userTable,
        Key: {
            email: email
        }
    };
    return await dynamodb.get(params).promise().then(response => {
        return response.Item;
    }, error => {
        console.error("There is an error while adding:", error);
    })
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

module.exports.register = register;