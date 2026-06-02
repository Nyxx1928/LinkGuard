import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// Attach token from localStorage to every request if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally (expired token, session timeout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            // Don't intercept auth endpoints (login/register) as 401 is expected there
            if (!url.includes('/api/login') && !url.includes('/api/register')) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('session_start');
                window.dispatchEvent(new CustomEvent('auth:session-expired'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
