import axiosClient from './axiosClient';

const eventService = {
    // Lấy sự kiện đã publish (Public), có thể truyền params { categoryId, name }
    getPublishedEvents(params) {
        return axiosClient.get('/api/events', { params }); //
    },

    // Lấy chi tiết một sự kiện (Public)
    getEventById(id) {
        return axiosClient.get(`/api/events/${id}`); //
    },

    // Lấy sự kiện do Organizer hiện tại tạo
    getMyEvents() {
        return axiosClient.get('/api/events/my-events'); //
    },

    // Dành cho Admin: Lấy tất cả sự kiện bất kể trạng thái
    getAllEventsAdmin() {
        return axiosClient.get('/api/events/all'); //
    }
};

export default eventService;