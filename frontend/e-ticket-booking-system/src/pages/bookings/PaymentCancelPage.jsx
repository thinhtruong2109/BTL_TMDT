import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Cancel, ArrowBack, Replay } from '@mui/icons-material';


const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderCode = searchParams.get('orderCode');
  const status = searchParams.get('status');

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
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Cancel sx={{ fontSize: 52, color: '#ef4444' }} />
          </Box>

          <Typography 
            variant="h5" 
            fontWeight={800} 
            gutterBottom 
            sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.primary' }}
          >
            Thanh toán đã bị huỷ
          </Typography>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, fontWeight: 500, lineHeight: 1.6, px: { xs: 1, sm: 3 } }}
          >
            Giao dịch thanh toán của bạn đã được hủy. Đơn đặt vé này và các vị trí ghế tương ứng đã được giải phóng trên hệ thống. 
            Bạn có thể thực hiện đặt lại vé mới bất cứ lúc nào.
          </Typography>

          {orderCode && (
            <Box 
              sx={{ 
                mb: 4, 
                p: 2.5, 
                bgcolor: 'rgba(239, 68, 68, 0.02)', 
                border: '1px dashed rgba(239, 68, 68, 0.2)',
                borderRadius: '16px', 
                textAlign: 'left' 
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Mã đơn hàng: <strong style={{ color: '#0f172a', fontWeight: 700 }}>{orderCode}</strong>
              </Typography>
              {status && (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Trạng thái đơn: <strong style={{ color: '#ef4444', fontWeight: 700 }}>{status}</strong>
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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
            
            <Button
              variant="contained"
              color="error"
              startIcon={<Replay />}
              onClick={() => navigate('/events')}
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
              Đặt vé mới
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentCancelPage;