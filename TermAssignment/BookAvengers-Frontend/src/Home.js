import React from 'react';

const Home = () => {
    return (
        <div>
            <h1>Welcome to BookAvengers</h1>
            <p>
                BookAvengers is an online book management platform that allows users to browse and manage their book collections. It provides features for adding new books, updating book status, and deleting books.
            </p>
            <p>
                Services Used in BookAvengers:
            </p>
            <ol>
                <li>AWS Lambda: Serverless functions are used to handle backend logic, such as registering users, managing book data, and handling user authentication.</li>
                <li>API Gateway: Acts as the entry point for API requests and manages the routing of those requests to the appropriate Lambda functions.</li>
                <li>EC2: Virtual server instances are used to host the frontend application and serve it to users.</li>
                <li>SNS (Simple Notification Service): Used for sending notifications to users, such as book updates or new releases.</li>
                <li>SQS (Simple Queue Service): Provides a message queue for asynchronous processing of book-related tasks, such as book indexing or processing user requests.</li>
                <li>DynamoDB: A NoSQL database service used to store and retrieve book data, user information, and other relevant information for the BookAvengers platform.</li>
            </ol>
        </div>
    );
};

export default Home;
