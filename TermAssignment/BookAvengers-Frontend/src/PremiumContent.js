import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {resetUserSession, getToken, getUser} from './service/AuthService.js';

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
        <div>
            Hello {email}!
            <input type="button" value="Logout" onClick={logoutHandler} />

            <h1>Book Library</h1>

            <h2>Books</h2>
            <ul>
                {books.map((book) => (
                    <li key={book.id}>
                        {book.name} - {book.status}
                        <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            <h2>Add Book</h2>
            <input type="text" value={newBook} onChange={(e) => setNewBook(e.target.value)} />
            <button onClick={handleAddBook}>Add Book</button>

            <div>
                <h2>Update Book Status</h2>
                <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)}>
                    <option value="">Select a book</option>
                    {books.map((book) => (
                        <option key={book.id} value={book.id}>
                            {book.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    value={bookStatus}
                    onChange={(e) => setBookStatus(e.target.value)}
                    placeholder="Enter new status"
                />
                <button onClick={handleUpdateStatus}>Update Status</button>
            </div>
        </div>
    );
};

export default PremiumContent;
