import axiosClient from "./axiosClient";

const ticketService = {
    getMyTickets() {
        return axiosClient.get('/api/tickets/my-tickets'); //
    },

    getTicketsByBooking(bookingId) {
        return axiosClient.get(`/api/tickets/booking/${bookingId}`); //
    },

    getTicketByCode(ticketCode) {
        return axiosClient.get(`/api/tickets/code/${ticketCode}`); //
    },

    checkIn(data) {
        return axiosClient.post('/api/tickets/check-in', data); //
    }
};

export default ticketService;