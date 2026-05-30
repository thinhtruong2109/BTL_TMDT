import axiosClient from './axiosClient';

const authService = {
    login(email, password) {
        return axiosClient.post('/api/auth/login', { email, password }); //
    },

    register(data) {
        return axiosClient.post('/api/auth/register', data); //
    },

    verifyEmail(data) {
        return axiosClient.post('/api/auth/verify-email', data); //
    },

    resendOtp(email) {
        return axiosClient.post('/api/auth/resend-otp', { email }); //
    },

    refreshToken(refreshToken) {
        return axiosClient.post('/api/auth/refresh-token', { refreshToken }); //
    },

    logout() {
        return axiosClient.post('/api/auth/logout'); //
    },
    
    loginWithGoogle() {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        window.location.href = `${baseURL}/oauth2/authorization/google`;
    }
};

export default authService;