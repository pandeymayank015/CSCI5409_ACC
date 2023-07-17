import React, { useState } from 'react';
import axios from 'axios';

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
            <h2>Register</h2>
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

export default Register;
