import React, { useState } from 'react';
import axios from 'axios';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
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

        const apiKey = 'z4RHzesbGa7yo0IEGP1n18DuLtfnzEdn6N1QwvyV';

        try {
            const response = await axios.post(
                'https://0i2oilda27.execute-api.us-east-1.amazonaws.com/prod/register',
                {
                    name,
                    email,
                    password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                    },
                }
            );

            if (response.status === 200) {
                // Registration successful
                alert(`Registration successful for user with email: ${email}`);
                // Perform any additional actions upon successful registration
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
