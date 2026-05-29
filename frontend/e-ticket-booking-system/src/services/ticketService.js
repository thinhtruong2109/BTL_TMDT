import axiosClient from "./axiosClient";

const ticketService = {
    // Lấy tất cả vé user đang sở hữu
    getMyTickets() {
        return axiosClient.get('/api/tickets/my-tickets'); //
    },

    // Lấy danh sách vé theo một booking cụ thể
    getTicketsByBooking(bookingId) {
        return axiosClient.get(`/api/tickets/booking/${bookingId}`); //
    },

    // Xem thông tin vé qua mã code (dùng cho QR code)
    getTicketByCode(ticketCode) {
        return axiosClient.get(`/api/tickets/code/${ticketCode}`); //
    },

    // Check-in vé (Staff/Organizer/Admin)
    checkIn(data) {
        return axiosClient.post('/api/tickets/check-in', data); //
    }
};

export default ticketService;