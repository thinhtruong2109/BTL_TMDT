import axiosClient from './axiosClient';

const transactionService = {
    
    createBooking(data) {
        return axiosClient.post('/api/bookings', data); //
    },

    cancelBooking(id) {
        return axiosClient.delete(`/api/bookings/${id}`); //
    },

    getBookingById(id) {
        return axiosClient.get(`/api/bookings/${id}`); //
    },


    createPayment(data) {
        return axiosClient.post('/api/payments', data); //
    },


    getAvailablePromoCodes(data) {
        return axiosClient.post('/api/promo-codes/available', data); //
    },


    getMyTransactions(params) {
        return axiosClient.get('/api/transaction-histories/my-transactions', { params }); //
    },

    getTransactionByBookingId(bookingId) {
        return axiosClient.get(`/api/transaction-histories/booking/${bookingId}`); //
    }
};

export default transactionService;