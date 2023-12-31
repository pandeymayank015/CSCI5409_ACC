const AWS = require('aws-sdk');
const sns = new AWS.SNS();

exports.handler = async (event) => {
    for (const record of event.Records) {
        const body = JSON.parse(record.body);

        const operation = body.operation;
        const email = body.email;

        let bookId, bookName, snsMessage;
        if (operation === 'save') {
            bookId = body.book.id;
            bookName = body.book.name;
            snsMessage = `User ${email} has added a new book ${bookName} to the library`;
        } else if (operation === 'delete') {
            bookId = body.bookId;
            bookName = body.bookName;
            snsMessage = `User ${email} has deleted the book ${bookName} with id ${bookId} from the library`;
        } else {
            console.error('Invalid operation:', operation);
            continue;
        }

        const params = {
            Message: snsMessage,
            Subject: `Book Operation - ${operation.toUpperCase()}`,
            TopicArn: `${process.env.NotificationSNSArn}`,
        };

        try {
            await sns.publish(params).promise();
            console.log(`SNS message sent for operation: ${operation}, book: ${bookName}`);
        } catch (error) {
            console.error('Error publishing SNS message:', error);
        }
    }
};