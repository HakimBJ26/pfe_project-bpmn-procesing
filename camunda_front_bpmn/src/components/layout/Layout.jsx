import React from 'react';
import { Box, CssBaseline, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children, sidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar open={sidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          width: '100%'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
