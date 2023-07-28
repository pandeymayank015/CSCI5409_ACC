import axios from 'axios';
const backendUrl = process.env.REACT_APP_BACKEND_URL;

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
    baseURL: `${backendUrl}/verify`,
    headers: {
        'Content-Type': 'application/json'
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