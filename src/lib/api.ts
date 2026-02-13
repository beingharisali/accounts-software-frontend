import axios from 'axios';

const getBaseURL = () => {
    const envURL = import.meta.env.VITE_API_URL;
    if (envURL) return envURL;

    return import.meta.env.PROD
        ? 'https://accounts-software-backend.onrender.com/api/v1'
        : 'http://localhost:5000/api/v1';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor (Purani logic intact hai)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized! Token might be expired or invalid.");

            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                localStorage.removeItem('userRole');
            }
        }
        return Promise.reject(error);
    }
);

export default api;