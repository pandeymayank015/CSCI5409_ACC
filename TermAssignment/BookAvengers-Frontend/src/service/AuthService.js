import axios from 'axios';

export const getUser = () => {
    const user = sessionStorage.getItem('user');
    if (!user || user === 'undefined') {
        return null;
    } else {
        return JSON.parse(user);
    }
};

export const getToken = () => {
    return sessionStorage.getItem('token');
};

export const setUserSession = (user, token) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
};

export const resetUserSession = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
};

export const axiosInstance = axios.create({
    baseURL: 'https://0i2oilda27.execute-api.us-east-1.amazonaws.com/prod',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'z4RHzesbGa7yo0IEGP1n18DuLtfnzEdn6N1QwvyV',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);