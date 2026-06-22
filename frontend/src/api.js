import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// Whitelist of public endpoints where 401 is expected and should NOT clear session
const PUBLIC_ENDPOINTS = [
    '/api/login',
    '/api/register',
    '/email/verify/',  // ends with / so we match startsWith for verification links
];

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
            // Check if the URL matches a public endpoint
            const isPublic = PUBLIC_ENDPOINTS.some(endpoint =>
                endpoint.endsWith('/') ? url.startsWith(endpoint) : url === endpoint
            );
            if (!isPublic) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('session_start');
                window.dispatchEvent(new CustomEvent('auth:session-expired'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
