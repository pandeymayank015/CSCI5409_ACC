import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {resetUserSession, getToken, getUser} from './service/AuthService.js';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
const PremiumContent = (props) => {
    const [books, setBooks] = useState([]);
    const [newBook, setNewBook] = useState('');
    const [selectedBook, setSelectedBook] = useState('');
    const [bookStatus, setBookStatus] = useState('');
    const email = JSON.parse(sessionStorage.getItem('user'))?.email || '';

    const fetchBooks = async () => {
        try {
            const token = getToken();
            const user = getUser();
            console.log('Generated token:', token); // Log the generated token
            console.log('email:', user.email);
            const response = await axios.get('https://0i2oilda27.execute-api.us-east-1.amazonaws.com/prod/books', {
                headers: {  'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Use the fetched token here
                },
            });
            setBooks(response.data.books);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []); // Empty dependency array to run the effect only once


    const handleAddBook = async () => {
        try {
            // Fetch the token using the AuthService getToken() function
            const token = getToken();
            const user = getUser();
            console.log('Generated token:', token); // Log the generated token
            console.log('email:', user.email);
            const response = await axios.post(
                'https://0i2oilda27.execute-api.us-east-1.amazonaws.com/prod/book',
                {
                    name: newBook,
                    status: 'Available',
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Use the fetched token here
                    },
                }
            );

            if (response.status === 200) {
                // Book addition successful
                setNewBook('');
                setBooks((prevBooks) => [...prevBooks, response.data.Item]);
                fetchBooks(); // Refresh books after successful addition
            } else {
                // Handle error if necessary
            }
        } catch (error) {
            console.error('Error adding book:', error);
            // Handle error if necessary
        }
    };


    const handleUpdateStatus = async () => {
        try {
            const token = getToken();
            const user = getUser();
            console.log('Generated token:', token); // Log the generated token
            console.log('email:', user.email);
            const response = await axios.patch(
                `https://0i2oilda27.execute-api.us-east-1.amazonaws.com/prod/book`,
                {
                    id: selectedBook,
                    updateKey: 'status',
                    updateValue: bookStatus,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const updatedBook = response.data.UpdatedAttributes;
            setBooks((prevBooks) =>
                prevBooks.map((book) => (book.id === updatedBook.id ? updatedBook : book))
            );
            setSelectedBook('');
            setBookStatus('');
            fetchBooks(); // Refresh books after successful status update
        } catch (error) {
            console.error('Error updating book status:', error);
        }
    };

    const handleDeleteBook = async (bookId) => {
        try {
            const token = getToken();
            const user = getUser();
            console.log('Generated token:', token); // Log the generated token
            console.log('email:', user.email);
            await axios.delete(
                'https://0i2oilda27.execute-api.us-east-1.amazonaws.com/prod/book',
                {
                    data: { id: bookId },
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };

    const logoutHandler = () => {
        resetUserSession();
        props.history.push('/login');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',  padding: '20px' }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
                <Typography variant="h4" gutterBottom>
                    Hello {email}!
                </Typography>
                <Button variant="contained" color="primary" onClick={logoutHandler}>
                    Logout
                </Button>

                <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
                    Book Library
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Books
                </Typography>
                <List>
                    {books.map((book) => (
                        <ListItem key={book.id}>
                            <ListItemText primary={`${book.name} - ${book.status}`} />
                            <Button color="secondary" onClick={() => handleDeleteBook(book.id)}>
                                Delete
                            </Button>
                        </ListItem>
                    ))}
                </List>

                <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                    Add Book
                </Typography>
                <Box display="flex" alignItems="center" style={{ marginBottom: '20px' }}>
                    <TextField
                        label="Book Name"
                        value={newBook}
                        onChange={(e) => setNewBook(e.target.value)}
                        variant="outlined"
                    />
                    <Button variant="contained" color="primary" onClick={handleAddBook} style={{ marginLeft: '10px' }}>
                        Add Book
                    </Button>
                </Box>

                <Typography variant="h6" gutterBottom>
                    Update Book Status
                </Typography>
                <FormControl variant="outlined" style={{ minWidth: '200px', marginBottom: '20px' }}>
                    <InputLabel>Select a book</InputLabel>
                    <Select
                        value={selectedBook}
                        onChange={(e) => setSelectedBook(e.target.value)}
                        label="Select a book"
                    >
                        <MenuItem value="">Select a book</MenuItem>
                        {books.map((book) => (
                            <MenuItem key={book.id} value={book.id}>
                                {book.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box display="flex" alignItems="center">
                    <FormControl variant="outlined" style={{ marginRight: '10px', minWidth: '200px' }}>
                        <InputLabel>Select new status</InputLabel>
                        <Select
                            value={bookStatus}
                            onChange={(e) => setBookStatus(e.target.value)}
                            label="Select new status"
                        >
                            <MenuItem value="In-Progress">In-Progress</MenuItem>
                            <MenuItem value="Not Started">Not Started</MenuItem>
                            <MenuItem value="Finished">Finished</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" onClick={handleUpdateStatus}>
                        Update Status
                    </Button>
                </Box>

            </div>
        </div>
);
};

export default PremiumContent;
