import axiosClient from './axiosClient';

const userService = {
    getProfile() {
        return axiosClient.get('/api/users/me'); //
    },
    
    updateProfile(data) {
        return axiosClient.put('/api/users/me', data); //
    },
    
    changePassword(data) {
        return axiosClient.put('/api/users/me/password', data); //
    },

    // Tài liệu không đề cập API upload ảnh riêng, nhưng nếu backend vẫn giữ route này:
    uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        return axiosClient.post('/api/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};

export default userService;