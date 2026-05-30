import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Visibility, Cancel } from '@mui/icons-material';
import { bookingApi } from '../../api';
import { LoadingScreen, ErrorAlert, EmptyState, PageHeader, StatusChip } from '../../components/common';
import { formatCurrency, formatDateTime, getErrorMessage } from '../../utils/helpers';

/**
 * Trang danh sách đơn đặt vé của tôi.
 * Đồng bộ phong cách thiết kế với hệ thống TickeZ.
 */
const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn huỷ đơn đặt vé này không?')) return;
    try {
      await bookingApi.cancel(id);
      fetchBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '90vh', pb: 8, fontFamily: 'Montserrat, sans-serif' }}>
      <PageHeader 
        title="Đơn Đặt Vé Của Tôi" 
        subtitle="Quản lý lịch sử đặt vé và trạng thái thanh toán của bạn" 
      />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && <ErrorAlert message={error} onRetry={fetchBookings} />}

        {loading ? (
          <LoadingScreen />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="Chưa có đơn đặt vé nào"
            description="Hãy khám phá các sự kiện nóng hổi và đặt những chiếc vé đầu tiên ngay!"
            actionLabel="Khám Phá Sự Kiện"
            onClick={() => navigate('/events')}
          />
        ) : (
          <TableContainer 
            component={Paper}
            elevation={0}
            sx={{ 
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              overflow: 'hidden'
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Mã đặt vé</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Sự kiện</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Số tiền</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Ngày đặt</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow 
                    key={booking.id} 
                    hover 
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight={700} 
                        sx={{ fontFamily: 'monospace', color: '#0f172a' }}
                      >
                        {booking.bookingCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight={600} 
                        color="text.primary"
                        sx={{ maxWidth: 280, noWrap: true, textOverflow: 'ellipsis', overflow: 'hidden' }}
                      >
                        {booking.eventName || `Sự kiện #${booking.eventId}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={800} color="#ef4444">
                        {formatCurrency(booking.finalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {formatDateTime(booking.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/my-bookings/${booking.id}`)}
                          sx={{
                            borderRadius: '15px', 
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            borderWidth: '1.5px',
                            px: 2,
                            '&:hover': {
                              borderWidth: '1.5px',
                            }
                          }}
                        >
                          Xem
                        </Button>
                        {booking.status === 'PENDING' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleCancel(booking.id)}
                            sx={{
                              borderRadius: '15px', 
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              bgcolor: '#ef4444',
                              px: 2,
                              '&:hover': {
                                bgcolor: '#dc2626',
                              }
                            }}
                          >
                            Hủy
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default MyBookingsPage;