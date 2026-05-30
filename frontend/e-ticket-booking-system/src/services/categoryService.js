// categoryService.js
import axiosClient from './axiosClient';

const categoryService = {
    getAllCategories() {
        return axiosClient.get('/api/event-categories');
    },

    getCategoryById(id) {
        return axiosClient.get(`/api/event-categories/${id}`);
    },

    createCategory(data) {
        return axiosClient.post('/api/event-categories', data);
    },

    updateCategory(id, data) {
        return axiosClient.put(`/api/event-categories/${id}`, data);
    },

    deleteCategory(id) {
        return axiosClient.delete(`/api/event-categories/${id}`);
    }
};

export default categoryService;