import React, { useState } from 'react';
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import axios from 'axios';
import { setUserSession } from './service/AuthService.js';

const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        // Perform validation on email and password fields
        if (!email || !password) {
            alert('Username or password is required.');
            return;
        }

        const apiKey = 'z4RHzesbGa7yo0IEGP1n18DuLtfnzEdn6N1QwvyV';

        try {
            const response = await axios.post(
                'https://0i2oilda27.execute-api.us-east-1.amazonaws.com/prod/login',
                {
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
                // Login successful
                const { user, token } = response.data;
                setUserSession(user, token); // Set user session using the AuthService
                console.log('Generated token:', token);
                localStorage.setItem('email', email);
                props.history.push('/premium-content')
                // Perform any additional actions upon successful login
            } else {
                // Login failed
                alert(response.data.message);
            }
        } catch (error) {
            console.error('An error occurred during login:', error);
            alert('An error occurred during login. Please try again later.');
        }
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>Login</Typography>
            <Box display="flex" flexDirection="column">
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
                <Button variant="contained" color="primary" onClick={handleLogin}>Login</Button>
            </Box>
        </div>
    );
};

export default Login;
