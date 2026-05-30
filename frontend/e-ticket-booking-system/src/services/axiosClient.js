// axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // BẮT BUỘC: Cho phép gửi và nhận HttpOnly Cookie (accessToken, refreshToken) tự động giữa các domain khác nhau
    withCredentials: true, 
});

axiosClient.interceptors.request.use(
    (config) => {
        // Giữ lại phần này phòng trường hợp hệ thống có lưu token song song ở localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => {
        // Giữ nguyên cơ chế trả về response.data để các Service khác hoạt động ổn định
        return response.data;
    },
    (error) => {
        // Xử lý khi token hết hạn hoặc không hợp lệ (mã 401 hoặc 403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default axiosClient;