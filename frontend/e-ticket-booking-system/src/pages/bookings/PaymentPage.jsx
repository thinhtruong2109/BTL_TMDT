import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import { Payment, Timer, AccountBalanceWallet } from '@mui/icons-material';
import { bookingApi, paymentApi } from '../../api';
import { LoadingScreen, ErrorAlert, PageHeader } from '../../components/common';
import { formatCurrency, getErrorMessage, toDateTimeMillis } from '../../utils/helpers';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!booking?.holdExpiresAt || booking.status !== 'PENDING') {
      setTimeLeft(null);
      return;
    }

    const expiresAtMs = toDateTimeMillis(booking.holdExpiresAt);
    if (!Number.isFinite(expiresAtMs)) {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
      setTimeLeft(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [booking?.holdExpiresAt, booking?.status]);

  const fetchBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.getById(bookingId);
      setBooking(res.data);
      if (res.data.status !== 'PENDING') {
        setError(`Đơn đặt vé này đang ở trạng thái ${res.data.status.toLowerCase()}. Không thể thực hiện thanh toán.`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await paymentApi.create({
        bookingId: parseInt(bookingId),
        paymentMethod: 'PAYOS',
      });

      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        navigate(`/my-bookings/${bookingId}`, { state: { paymentSuccess: true } });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingScreen />;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '90vh', pb: 8, fontFamily: 'Montserrat, sans-serif' }}>
      <PageHeader 
        title="Thanh Toán Vé" 
        subtitle={`Mã đặt vé #${booking?.bookingCode || bookingId}`} 
      />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {error && <ErrorAlert message={error} />}

        {/* Thanh đếm ngược thời gian giữ vé */}
        {timeLeft !== null && timeLeft > 0 && (
          <Alert
            severity={timeLeft < 120 ? 'warning' : 'info'}
            icon={<Timer sx={{ color: timeLeft < 120 ? '#f59e0b' : '#ef4444' }} />}
            sx={{
              mb: 3,
              borderRadius: '16px',
              fontWeight: 600,
              border: '1px solid',
              borderColor: timeLeft < 120 ? '#fef3c7' : '#fee2e2',
              bgcolor: timeLeft < 120 ? '#fffbeb' : '#fef2f2',
              color: timeLeft < 120 ? '#b45309' : '#991b1b',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          >
            Thời gian giữ vé còn lại: <strong style={{ fontSize: '1rem', marginLeft: '4px' }}>{formatTime(timeLeft)}</strong>
          </Alert>
        )}

        {booking && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: '20px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={750} sx={{ letterSpacing: '0.5px' }}>
              Thông Tin Đơn Hàng
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />

            {booking.bookingDetails?.map((detail, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {detail.ticketTypeName || `Loại vé #${detail.ticketTypeId}`} <span style={{ fontWeight: 700, color: '#ef4444' }}>x {detail.quantity}</span>
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {formatCurrency(detail.subtotal)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Tạm tính</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(booking.totalAmount)}</Typography>
            </Box>

            {booking.discountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="#10b981" fontWeight={500}>Khuyến mãi</Typography>
                <Typography variant="body2" color="#10b981" fontWeight={700}>
                  -{formatCurrency(booking.discountAmount)}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={800} color="text.primary">Tổng thanh toán</Typography>
              <Typography variant="h5" fontWeight={900} color="#ef4444">
                {formatCurrency(booking.finalAmount)}
              </Typography>
            </Box>
          </Paper>
        )}

        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight={750} sx={{ letterSpacing: '0.5px' }}>
            Phương Thức Thanh Toán
          </Typography>
          <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />

          <Box
            sx={{
              p: 2.5,
              border: '2px solid',
              borderColor: '#ef4444',
              borderRadius: '14px',
              bgcolor: 'rgba(239, 68, 68, 0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <AccountBalanceWallet sx={{ color: '#ef4444', fontSize: '28px' }} />
            <Box>
              <Typography variant="body1" fontWeight={800} color="text.primary">Cổng PayOS</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Thanh toán an toàn, tức thì qua cổng ngân hàng PayOS
              </Typography>
            </Box>
            <Chip 
              label="Đang chọn" 
              sx={{ 
                ml: 'auto', 
                bgcolor: '#ef4444', 
                color: '#fff', 
                fontWeight: 'bold', 
                fontSize: '0.7rem',
                height: '24px'
              }} 
            />
          </Box>
        </Paper>

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<Payment />}
          onClick={handlePay}
          disabled={submitting || booking?.status !== 'PENDING'}
          sx={{ 
            py: 1.8, 
            borderRadius: '25px', 
            bgcolor: '#ef4444',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
            textTransform: 'uppercase',
            '&:hover': {
              bgcolor: '#dc2626',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
            },
            '&:disabled': {
              bgcolor: '#cbd5e1',
              color: '#94a3b8'
            }
          }}
        >
          {submitting ? 'Đang kết nối cổng thanh toán...' : `Thanh toán ngay ${formatCurrency(booking?.finalAmount || 0)}`}
        </Button>
      </Container>
    </Box>
  );
};

export default PaymentPage;