import React from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const Home = () => {
    return (
        <div>
            <Typography variant="h4" gutterBottom>Welcome to BookAvengers</Typography>
            <Typography variant="body1" gutterBottom>
                BookAvengers is an online book management platform that allows users to browse and manage their book collections.
                It provides features for adding new books, updating book status, and deleting books.
            </Typography>
            <Typography variant="h6" gutterBottom>Services Used in BookAvengers:</Typography>
            <List>
                <ListItem>
                    <ListItemText primary="AWS Lambda: Serverless functions are used to handle backend logic, such as registering users, managing book data, and handling user authentication." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="API Gateway: Acts as the entry point for API requests and manages the routing of those requests to the appropriate Lambda functions." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="EC2: Virtual server instances are used to host the frontend application and serve it to users." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="SNS (Simple Notification Service): Used for sending notifications to users, such as book updates or new releases." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="SQS (Simple Queue Service): Provides a message queue for asynchronous processing of book-related tasks, such as book indexing or processing user requests." />
                </ListItem>
                <ListItem>
                <ListItemText primary="DynamoDB: A NoSQL database service used to store and retrieve book data, user information, and other relevant information for the BookAvengers platform." />
                </ListItem>


                {/* Add other list items as needed */}
            </List>
        </div>
    );
};

export default Home;
