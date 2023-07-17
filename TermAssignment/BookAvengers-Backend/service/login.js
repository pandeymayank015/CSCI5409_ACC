const AWS = require('aws-sdk');
AWS.config.update(
    {region: 'us-east-1'});

const util = require ('../utils/util');
const bcrypt = require('bcryptjs');
const auth = require ('../utils/auth');
//const {buildResponse} = require("../utils/util");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'bookavengers-users';

async function login(user){
    const email =user.email;
    const password = user.password;
    if (!user || !email || !password){
        return util.buildResponse(401, {
            message: 'username or password required'
        });
    }
    const dynamoUser = await getUser(email);
    if (!dynamoUser || !dynamoUser.email) {
        return util.buildResponse(403, {
            message: 'user does not exist'
        });
    }
    if (!bcrypt.compareSync(password, dynamoUser.password)){
        return util.buildResponse(403, {message: 'password does not match'});
    }
    const userInfo={
        email: dynamoUser.email,
        name: dynamoUser.name
    };
    const token = auth.generateToken(userInfo);
    const response ={
        user: userInfo,
        token: token
    };
    return util.buildResponse(200, response);
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
    });
}
module.exports.login = login;