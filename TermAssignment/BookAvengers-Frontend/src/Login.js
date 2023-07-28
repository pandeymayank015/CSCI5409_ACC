import React, { useState } from 'react';
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import axios from 'axios';
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        // Perform validation on email and password fields
        if (!email || !password) {
            alert('Username or password is required.');
            return;
        }
        try {
            const response = await axios.post(
                `${backendUrl}/login`,
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                // Login successful
                sessionStorage.setItem('user', JSON.stringify({ email }));
                props.history.push('/premium-content');
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
