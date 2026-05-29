import axiosClient from './axiosClient';

const transactionService = {
    /* --- PHẦN ĐẶT VÉ (BOOKING) --- */
    
    // Thay thế cho checkout() cũ: Tạo đơn đặt vé mới (PENDING, giữ chỗ 15 phút)
    createBooking(data) {
        return axiosClient.post('/api/bookings', data); //
    },

    // Hủy đơn đặt vé
    cancelBooking(id) {
        return axiosClient.delete(`/api/bookings/${id}`); //
    },

    // Lấy chi tiết booking
    getBookingById(id) {
        return axiosClient.get(`/api/bookings/${id}`); //
    },

    /* --- PHẦN THANH TOÁN (PAYMENT) --- */

    // Tạo thanh toán (VD: PAYOS)
    createPayment(data) {
        return axiosClient.post('/api/payments', data); //
    },

    /* --- PHẦN MÃ GIẢM GIÁ (PROMO CODE) --- */

    // Thay thế cho getAllVouchers(): Kiểm tra các mã giảm giá có thể dùng cho đơn hàng
    getAvailablePromoCodes(data) {
        return axiosClient.post('/api/promo-codes/available', data); //
    },

    /* --- PHẦN LỊCH SỬ GIAO DỊCH (TRANSACTION HISTORY) --- */

    // Lấy lịch sử giao dịch của tôi
    getMyTransactions(params) {
        return axiosClient.get('/api/transaction-histories/my-transactions', { params }); //
    },

    // Lấy lịch sử giao dịch theo một booking
    getTransactionByBookingId(bookingId) {
        return axiosClient.get(`/api/transaction-histories/booking/${bookingId}`); //
    }
};

export default transactionService;