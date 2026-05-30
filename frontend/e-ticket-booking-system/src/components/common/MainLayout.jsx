// src/components/common/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
// Import Header/Footer thế hệ mới
import HeaderBar from '../HeaderBar'; 
import Footer from '../Footer';       

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderBar /> {/* Dùng Header mới */}
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> 
      </Box>
      
      <Footer /> {/* Dùng Footer mới */}
    </Box>
  );
};

export default MainLayout;