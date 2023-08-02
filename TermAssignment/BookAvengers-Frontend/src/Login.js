import React, { useState } from 'react';
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import axios from 'axios';
const backendUrl = process.env.REACT_APP_API_ENDPOINT;

const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Username or password is required.');
            return;
        }
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/prod/login`,
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                sessionStorage.setItem('user', JSON.stringify({ email }));
                props.history.push('/premium-content');
            } else {
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
