const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

const registerService = require('./service/register');
const loginService = require('./service/login');
const verifyService = require('./service/verify');
const bookService = require('./service/book');
const util = require('./utils/util');
const healthPath = '/health';
const registerPath = '/register';
const loginPath = '/login';
const verifyPath = '/verify';
const bookPath = '/book';
const booksPath = '/books';

exports.handler = async (event) => {
    console.log('Request Event: ', event);
    let response;
    switch (true) {
        case event.httpMethod === 'GET' && event.path === healthPath:
            response = util.buildResponse(200);
            break;
        case event.httpMethod === 'POST' && event.path === registerPath:
            const registerBody = JSON.parse(event.body);
            response = await registerService.register(registerBody);
            break;
        case event.httpMethod === 'POST' && event.path === loginPath:
            const loginBody = JSON.parse(event.body);
            response = await loginService.login(loginBody);
            break;
        case event.httpMethod === 'POST' && event.path === verifyPath:
            const verifyBody = JSON.parse(event.body);
            response = await verifyService.verify(verifyBody);
            break;
        case event.httpMethod === 'GET' && event.path === bookPath:
            const getBookToken = event.headers.Authorization;
            response = await bookService.getBook(event.queryStringParameters.id, getBookToken);
            break;
        case event.httpMethod === 'GET' && event.path === booksPath:
            const getBooksToken = event.headers.Authorization;
            response = await bookService.getBooks(getBooksToken);
            break;
        case event.httpMethod === 'POST' && event.path === bookPath:
            const requestBody = JSON.parse(event.body);
            const token = event.headers.Authorization; // Assuming the token is sent in the Authorization header
            response = await bookService.saveBook(requestBody, token);
            break;
        case event.httpMethod === 'PATCH' && event.path === bookPath:
            const patchRequestBody = JSON.parse(event.body);
            const patchToken = event.headers.Authorization; // Assuming the token is sent in the Authorization header
            response = await bookService.modifyBook(patchRequestBody.id, patchRequestBody.updateKey, patchRequestBody.updateValue, patchToken);
            break;
        case event.httpMethod === 'DELETE' && event.path === bookPath:
            const deleteRequestBody = JSON.parse(event.body);
            const deleteToken = event.headers.Authorization; // Assuming the token is sent in the Authorization header
            response = await bookService.deleteBook(deleteRequestBody.id, deleteToken);
            break;
        default:
            response = util.buildResponse(404, '404 Not Found');
    }
    return response;
};
