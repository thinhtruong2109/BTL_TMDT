import axiosClient from './axiosClient';

const eventService = {
    getPublishedEvents(params) {
        return axiosClient.get('/api/events', { params }); //
    },

    getEventById(id) {
        return axiosClient.get(`/api/events/${id}`); //
    },

    getMyEvents() {
        return axiosClient.get('/api/events/my-events'); //
    },

    getAllEventsAdmin() {
        return axiosClient.get('/api/events/all'); //
    }
};

export default eventService;