import { Box, Typography, Button, Container } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          fontFamily: 'Montserrat, sans-serif', // Đồng bộ font Montserrat của TickeZ
        }}
      >
        {/* Vùng chứa Icon được cách điệu mềm mại */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', // Màu đỏ nhạt nền phía sau
            mb: 4,
          }}
        >
          <LockOutlined sx={{ fontSize: 60, color: 'error.main' }} />
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '4.5rem', md: '5.5rem' },
            color: 'error.main', // Sử dụng mã màu đỏ lỗi/primary của hệ thống
            lineHeight: 1,
            mb: 1,
          }}
        >
          403
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            color: 'text.primary',
            mb: 2,
          }}
        >
          Không có quyền truy cập
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 4,
            maxWidth: 450,
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          Khu vực này hiện không có sẵn cho tài khoản của bạn hoặc yêu cầu quyền truy cập đặc biệt.
          Vui lòng quay lại trang chủ hoặc liên hệ quản trị viên.
        </Typography>

        {/* Cấu trúc nút bo tròn (pill-shape) đồng bộ với HeaderBar của TickeZ */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="error" // Hoặc "primary" tùy theo cấu trúc palette MUI trong dự án
            onClick={() => navigate('/')}
            sx={{
              fontWeight: 'bold',
              px: 4,
              py: 1.2,
              borderRadius: '25px', // Bo tròn kiểu TickeZ
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '1px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              }
            }}
          >
            Về Trang Chủ
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            onClick={() => navigate(-1)}
            sx={{
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
              },
              fontWeight: 'bold',
              px: 4,
              py: 1.2,
              borderRadius: '25px',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '1px',
            }}
          >
            Quay Lại
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ForbiddenPage;