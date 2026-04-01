
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const tenantId = localStorage.getItem('tenantId');
        if (tenantId) {
            config.headers['X-Tenant-Id'] = tenantId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                    const { token } = response.data.data;
                    localStorage.setItem('token', token);
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/auth';
                }
            } else {
                localStorage.removeItem('token');
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
