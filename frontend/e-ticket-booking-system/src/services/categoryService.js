// categoryService.js
import axiosClient from './axiosClient';

const categoryService = {
    // 4.1. Lấy tất cả categories (Public)
    getAllCategories() {
        return axiosClient.get('/api/event-categories');
    },

    // 4.2. Xem chi tiết category (Public)
    getCategoryById(id) {
        return axiosClient.get(`/api/event-categories/${id}`);
    },

    // 4.3. Tạo category (Admin)
    createCategory(data) {
        return axiosClient.post('/api/event-categories', data);
    },

    // 4.4. Cập nhật category (Admin)
    updateCategory(id, data) {
        return axiosClient.put(`/api/event-categories/${id}`, data);
    },

    // 4.5. Xóa category (Admin)
    deleteCategory(id) {
        return axiosClient.delete(`/api/event-categories/${id}`);
    }
};

export default categoryService;