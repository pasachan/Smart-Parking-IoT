import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const NavBar = () => {
  const location = useLocation();
  return (
    <AppBar position="static" color="primary" elevation={3}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalParkingIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Smart Parking System
          </Typography>
        </Box>
        <Box>
          <Button
            component={Link}
            to="/booking"
            color={location.pathname === '/booking' ? 'secondary' : 'inherit'}
            variant={location.pathname === '/booking' ? 'contained' : 'text'}
            sx={{ mx: 1, fontWeight: 600 }}
            startIcon={<LocalParkingIcon />}
          >
            Booking
          </Button>
          <Button
            component={Link}
            to="/admin"
            color={location.pathname === '/admin' ? 'secondary' : 'inherit'}
            variant={location.pathname === '/admin' ? 'contained' : 'text'}
            sx={{ mx: 1, fontWeight: 600 }}
            startIcon={<AdminPanelSettingsIcon />}
          >
            Admin
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/booking" replace />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
};

export default App;
