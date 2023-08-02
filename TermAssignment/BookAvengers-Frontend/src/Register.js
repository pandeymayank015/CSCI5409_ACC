import React, { useState } from 'react';
import axios from 'axios';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
const backendUrl = process.env.REACT_APP_API_ENDPOINT;

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (!name || !email || !password) {
            alert('All fields are required.');
            return;
        }
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/prod/register`,
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
                alert(`Registration successful for user with email: ${email}`);
                sessionStorage.setItem('user', JSON.stringify({ email }));
            } else {
                alert(response.data.message);
                console.log("env variable:",`${process.env.REACT_APP_API_ENDPOINT}`);
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
