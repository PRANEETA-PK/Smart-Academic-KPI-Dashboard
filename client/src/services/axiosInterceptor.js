import axios from "axios";

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
