import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, Divider, Grid, Alert,
} from '@mui/material';
import { ArrowBack, Payment } from '@mui/icons-material';
import { bookingApi, ticketApi, paymentApi } from '../../api';
import { LoadingScreen, ErrorAlert, PageHeader, StatusChip } from '../../components/common';
import { formatCurrency, formatDateTime, getErrorMessage } from '../../utils/helpers';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const showSuccess = location.state?.paymentSuccess;

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingRes = await bookingApi.getById(id);
      const bookingData = bookingRes.data || bookingRes;
      setBooking(bookingData);

      if (bookingData) {
        const [ticketsRes, payRes] = await Promise.allSettled([
          ticketApi.getByBooking(id),
          paymentApi.getByBooking(id)
        ]);

        if (ticketsRes.status === 'fulfilled') {
          const tData = ticketsRes.value.data || ticketsRes.value;
          setTickets(Array.isArray(tData) ? tData : []);
        }

        if (payRes.status === 'fulfilled') {
          setPayment(payRes.value.data || payRes.value);
        } else {
          setPayment(null);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <Container sx={{ py: 4 }}><ErrorAlert message={error} /></Container>;
  if (!booking) return null;

  return (
    <Box sx={{ bgcolor: '#fbfcfd', minHeight: '100vh', pb: 8, pt: 2, fontFamily: 'Montserrat, sans-serif' }}>
      <Container maxWidth="lg">
        <PageHeader
          title={`Đơn Hàng #${booking.bookingCode}`}
          chip="CHI TIẾT"
          action={
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/my-bookings')}
              sx={{
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#f1f5f9' }
              }}
            >
              Quay lại danh sách
            </Button>
          }
        />

        {showSuccess && (
          <Alert
            severity="success"
            sx={{
              mb: 4, borderRadius: '16px', fontWeight: 600,
              bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0'
            }}
          >
            Thanh toán thành công! Vé điện tử của bạn đang được khởi tạo và gửi qua email.
          </Alert>
        )}

        {/* BẮT ĐẦU FIX LỖI GRID TẠI ĐÂY */}
        <Grid container spacing={4}>
          {/* Thay vì <Grid item xs={12} md={8}>, ta dùng <Grid size={{ xs: 12, md: 8 }}> */}
          <Grid size={{ xs: 12, md: 8 }}>

            {/* THÔNG TIN ĐƠN HÀNG */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '24px', border: '1px solid #eef2f6' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={800} color="#0f172a">Thông Tin Đơn Hàng</Typography>
                <StatusChip status={booking.status} />
              </Box>

              {booking.bookingDetails?.map((detail, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 2, borderBottom: '1px solid #f1f5f9' }}>
                  <Box>
                    <Typography variant="body1" fontWeight={700} color="#1e293b">
                      {detail.ticketTypeName || `Loại vé #${detail.ticketTypeId}`}
                    </Typography>
                    <Typography variant="body2" color="#64748b" fontWeight={500} mt={0.5}>
                      {formatCurrency(detail.unitPrice)} × {detail.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={800} color="#0f172a">
                    {formatCurrency(detail.subtotal)}
                  </Typography>
                </Box>
              ))}

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body1" color="#64748b" fontWeight={500}>Tạm tính</Typography>
                  <Typography variant="body1" fontWeight={700} color="#334155">{formatCurrency(booking.totalAmount)}</Typography>
                </Box>

                {booking.discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body1" color="#10b981" fontWeight={600}>Khuyến mãi</Typography>
                    <Typography variant="body1" color="#10b981" fontWeight={800}>-{formatCurrency(booking.discountAmount)}</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography fontWeight={800} color="#0f172a" sx={{ fontSize: '1.1rem' }}>Tổng thanh toán</Typography>
                  <Typography variant="h5" fontWeight={900} color="#ea580c">{formatCurrency(booking.finalAmount)}</Typography>
                </Box>
              </Box>
            </Paper>

            {/* VÉ ĐIỆN TỬ */}
            {tickets.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#0f172a' }}>Vé Điện Tử Của Bạn</Typography>
                <Grid container spacing={3}>
                  {tickets.map((ticket) => (
                    // Đổi sang cú pháp size cho vé điện tử
                    <Grid size={{ xs: 12, sm: 6 }} key={ticket.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          position: 'relative', bgcolor: '#ffffff',
                          border: '1px solid #eef2f6', borderRadius: '16px', p: 3,
                          overflow: 'hidden',
                          '&::before, &::after': {
                            content: '""', position: 'absolute', top: '50%',
                            width: '20px', height: '20px', borderRadius: '50%',
                            bgcolor: '#fbfcfd', transform: 'translateY(-50%)',
                            border: '1px solid #eef2f6', zIndex: 2,
                          },
                          '&::before': { left: '-11px' },
                          '&::after': { right: '-11px' },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="caption" fontWeight={800} color="#ea580c" sx={{ letterSpacing: '1px' }}>
                            TICKEZ PASS
                          </Typography>
                          <StatusChip status={ticket.checkedIn ? "COMPLETED" : "PENDING"} />
                        </Box>

                        <Typography variant="h5" fontWeight={900} sx={{ fontFamily: 'monospace', color: '#0f172a', textAlign: 'center', my: 2 }}>
                          {ticket.ticketCode}
                        </Typography>

                        <Divider sx={{ borderStyle: 'dashed', my: 2, borderColor: '#cbd5e1' }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="caption" color="#94a3b8" fontWeight={600}>Hạng vé</Typography>
                            <Typography variant="body2" fontWeight={800} color="#334155">{ticket.ticketTypeName || '-'}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="#94a3b8" fontWeight={600}>Vị trí</Typography>
                            <Typography variant="body2" fontWeight={800} color="#ea580c">{ticket.seatNumber || 'N/A'}</Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>

          {/* CỘT PHẢI - Thay đổi cú pháp size */}
          <Grid size={{ xs: 12, md: 4 }}>

            {/* THANH TOÁN */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '24px', border: '1px solid #eef2f6' }}>
              <Typography variant="h6" gutterBottom fontWeight={800} color="#0f172a">Thanh Toán</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>

                {/* 1. HIỂN THỊ THÔNG TIN GIAO DỊCH (NẾU TỒN TẠI) */}
                {payment && payment.status && (
                  <Box sx={{
                    mb: booking.status === 'PENDING' ? 2 : 0,
                    pb: booking.status === 'PENDING' ? 2 : 0,
                    borderBottom: booking.status === 'PENDING' ? '1px dashed #e2e8f0' : 'none'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body2" color="#64748b" fontWeight={600}>Phương thức</Typography>
                      <Typography variant="body2" fontWeight={800} color="#f94f2f">{payment.paymentMethod}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: payment.transactionId ? 1.5 : 0 }}>
                      <Typography variant="body2" color="#64748b" fontWeight={600}>Trạng thái GD</Typography>
                      <StatusChip status={payment.status} />
                    </Box>
                    {payment.transactionId && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="#64748b" fontWeight={600}>Mã GD</Typography>
                        <Typography variant="caption" fontFamily="monospace" fontWeight={700} color="#f94f2f">{payment.transactionId}</Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* 2. LUÔN HIỂN THỊ NÚT THANH TOÁN NẾU ĐƠN ĐANG PENDING */}
                {booking.status === 'PENDING' ? (
                  <Box>
                    <Typography variant="body2" color="#64748b" sx={{ mb: 2, fontWeight: 500 }}>
                      Vui lòng hoàn tất thanh toán để nhận vé.
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Payment />}
                      onClick={() => navigate(`/payment/${id}`)}
                      sx={{
                        py: 1.5, borderRadius: '12px', bgcolor: '#f94f2f',
                        fontWeight: 700, textTransform: 'none', fontSize: '0.9rem',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                        '&:hover': { bgcolor: '#f94f2f' }
                      }}
                    >
                      Thanh Toán Ngay
                    </Button>
                  </Box>
                ) : !payment?.status && (
                  // Nếu không PENDING và cũng không có payment thì báo trống
                  <Typography variant="body2" color="#64748b" fontWeight={500}>Không có dữ liệu giao dịch.</Typography>
                )}
              </Box>
            </Paper>

            {/* THÔNG TIN SỰ KIỆN */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #eef2f6' }}>
              <Typography variant="h6" gutterBottom fontWeight={800} color="#0f172a">Thông Tin Bổ Sung</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <Box>
                  <Typography variant="caption" color="#94a3b8" fontWeight={600}>Tên sự kiện</Typography>
                  <Typography variant="body2" fontWeight={800} color="#f94f2f" mt={0.5}>
                    {booking.eventName || `#${booking.eventId}`}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="#94a3b8" fontWeight={600}>Ngày đặt</Typography>
                  <Typography variant="body2" fontWeight={700} color="#334155" mt={0.5}>
                    {formatDateTime(booking.createdAt)}
                  </Typography>
                </Box>
                {booking.holdExpiresAt && booking.status === 'PENDING' && (
                  <Box>
                    <Typography variant="caption" color="#94a3b8" fontWeight={600}>Hạn thanh toán</Typography>
                    <Typography variant="body2" fontWeight={800} color="#ea580c" mt={0.5}>
                      {formatDateTime(booking.holdExpiresAt)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BookingDetailPage;