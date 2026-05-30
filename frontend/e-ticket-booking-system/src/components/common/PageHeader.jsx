import { Box, Typography, Chip, Container } from '@mui/material';

const PageHeader = ({ title, subtitle, action, chip }) => (
  <Box
    sx={{
      // Sử dụng màu nền sáng sang trọng thay vì màu Primary gắt
      bgcolor: '#ffffff',
      borderBottom: '1px solid #eef2f6',
      py: { xs: 4, md: 6 },
      px: 2,
      mb: 4,
    }}
  >
    <Container maxWidth="lg">
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: 3 
      }}>
        <Box>
          {chip && (
            <Chip
              label={chip}
              size="small"
              sx={{
                mb: 2,
                bgcolor: '#f1f5f9', // Màu xám rất nhạt
                color: '#64748b',   // Màu xám đậm hơn một chút
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                borderRadius: '6px',
              }}
            />
          )}
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#0f172a', // Màu Slate-900 (tránh đen thuần)
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: '#64748b', mt: 1, maxWidth: '600px' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {action}
          </Box>
        )}
      </Box>
    </Container>
  </Box>
);

export default PageHeader;