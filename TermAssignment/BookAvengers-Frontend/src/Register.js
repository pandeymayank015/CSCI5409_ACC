import React, { useState } from 'react';
import axios from 'axios';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        // Perform validation on name, email, and password fields
        if (!name || !email || !password) {
            alert('All fields are required.');
            return;
        }
        try {
            const response = await axios.post(
                `${backendUrl}/register`,
                {
                    name,
                    email,
                    password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }
            );

            if (response.status === 200) {
                // Registration successful
                alert(`Registration successful for user with email: ${email}`);
                sessionStorage.setItem('user', JSON.stringify({ email }));
            } else {
                // Registration failed
                alert(response.data.message);
            }
        } catch (error) {
            console.error('An error occurred during registration:', error);
            alert('An error occurred during registration. Please try again later.');
        }
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>Register</Typography>
            <Box display="flex" flexDirection="column">
                <TextField
                    label="Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleRegister}>Register</Button>
            </Box>
        </div>
    );
};

export default Register;
