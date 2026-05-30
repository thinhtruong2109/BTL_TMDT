import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CheckCircle, ConfirmationNumber, ArrowBack, HourglassTop } from '@mui/icons-material';
import { paymentApi } from '../../api';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderCode = searchParams.get('orderCode');
  const statusFromUrl = searchParams.get('status');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (orderCode) {
      fetchPaymentInfo();
    } else {
      setLoading(false);
      setError('Không tìm thấy mã đơn hàng (orderCode).');
    }
  }, [orderCode]);

  const fetchPaymentInfo = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getByOrderCode(orderCode);
      setPaymentInfo(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 3, color: '#ef4444' }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            Đang xác nhận thanh toán...
          </Typography>
        </Container>
      </Box>
    );
  }

  const status = paymentInfo?.status || statusFromUrl;
  const isSuccess = status === 'SUCCESS';

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '85vh', py: 8, display: 'flex', alignItems: 'center', fontFamily: 'Montserrat, sans-serif' }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 5 }, 
            textAlign: 'center',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              mx: 'auto',
              mb: 3,
            }}
          >
            {isSuccess ? (
              <CheckCircle sx={{ fontSize: 52, color: '#10b981' }} />
            ) : (
              <HourglassTop sx={{ fontSize: 52, color: '#f59e0b' }} />
            )}
          </Box>

          <Typography 
            variant="h5" 
            fontWeight={800} 
            gutterBottom 
            sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.primary' }}
          >
            {isSuccess ? 'Thanh toán thành công!' : 'Đang xử lý thanh toán'}
          </Typography>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, fontWeight: 500, lineHeight: 1.6, px: { xs: 1, sm: 2 } }}
          >
            {isSuccess
              ? 'Vé của bạn đã được xác nhận thành công. Vui lòng kiểm tra hòm thư email để nhận vé điện tử.'
              : 'Giao dịch thanh toán đang được xử lý kiểm tra. Vui lòng chờ trong giây lát.'}
          </Typography>

          {error && (
            <Alert severity="warning" sx={{ mb: 4, textAlign: 'left', borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <Box 
            sx={{ 
              mb: 4, 
              p: 2.5, 
              bgcolor: isSuccess ? 'rgba(16, 185, 129, 0.02)' : 'rgba(245, 158, 11, 0.02)', 
              border: '1px dashed',
              borderColor: isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              borderRadius: '16px', 
              textAlign: 'left' 
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Mã đơn hàng: <strong style={{ color: '#0f172a', fontWeight: 700 }}>{orderCode}</strong>
            </Typography>
            {paymentInfo?.bookingCode && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Mã đặt vé: <strong style={{ color: '#0f172a', fontWeight: 700 }}>{paymentInfo.bookingCode}</strong>
              </Typography>
            )}
            {paymentInfo?.amount && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Số tiền thanh toán: <strong style={{ color: '#0f172a', fontWeight: 700 }}>{formatCurrency(paymentInfo.amount)}</strong>
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Trạng thái thanh toán: <strong style={{ color: isSuccess ? '#10b981' : '#f59e0b', fontWeight: 700 }}>{status}</strong>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {paymentInfo?.bookingId && (
              <Button
                variant="contained"
                color="error"
                startIcon={<ConfirmationNumber />}
                onClick={() => navigate(`/my-bookings/${paymentInfo.bookingId}`)}
                sx={{
                  fontWeight: 'bold',
                  px: 3.5,
                  py: 1.2,
                  borderRadius: '25px',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  bgcolor: '#ef4444',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
                  '&:hover': {
                    bgcolor: '#dc2626',
                    boxShadow: '0 6px 18px rgba(239, 68, 68, 0.35)',
                  }
                }}
              >
                Xem chi tiết đơn
              </Button>
            )}
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/my-bookings')}
              sx={{
                fontWeight: 'bold',
                px: 3.5,
                py: 1.2,
                borderRadius: '25px',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '1px',
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                }
              }}
            >
              Đơn đặt vé của tôi
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPage;