import axios from "axios";

// Automatically use the Render URL in production, or localhost during development
axios.defaults.baseURL = import.meta.env.PROD 
    ? import.meta.env.VITE_API_URL 
    : "http://localhost:5000";

const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const user = localStorage.getItem("user");
            if (user) {
                const { token } = JSON.parse(user);
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

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem("user");
                // Optional: window.location.href = "/login";
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;
