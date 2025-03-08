import axios from "axios";
import { getToken, clearToken, clearUsername } from "../utils/tokenStorage";
// Giả sử bạn đã có getUsername trong tokenStorage
import { getUsername } from "../utils/tokenStorage";

const API_URL = "https://hairsalon-m4jx.onrender.com";

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor cho request: Thêm token và username từ IndexedDB vào header
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        const username = await getUsername();
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (username) {
            config.headers['X-Username'] = username; // Thêm username vào header
        }
        return config;
    },
    (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);

// Interceptor cho response: Xử lý lỗi 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log("Response error:", error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            await clearToken();
            await clearUsername();
            window.location.href = "/auth";
        }
        return Promise.reject(error);
    }
);

export default api;