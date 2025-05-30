import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Card, CardContent,
  Button, Box, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TextField, Snackbar, Alert
} from '@mui/material';
import {
  LocalParking, AccessTime, PersonOutline, CheckCircle,
  Refresh, Search, Add, LockOpen, Lock, History, Upcoming
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const API_BASE = 'https://okarusuvo.com/parking';

const MainContainer = styled(Container)(({ theme }) => ({
  background: theme.palette.grey[100],
  minHeight: '100vh',
  paddingTop: theme.spacing(2), // reduced from 8 to 2
  paddingBottom: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const MainPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  background: theme.palette.background.paper,
}));

const SlotCard = styled(Card)(({ theme, occupied }) => ({
  background: occupied
    ? theme.palette.error.light
    : '#e6ffe6', // lighter green for available
  color: theme.palette.getContrastText(occupied ? theme.palette.error.light : '#e6ffe6'),
  border: '2px solid',
  borderColor: occupied ? theme.palette.error.main : '#b2fab4',
  minHeight: 90,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const AdminPage = () => {
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    availableSlots: 0,
    occupiedSlots: 0
  });
  const [cancelDialog, setCancelDialog] = useState({ open: false, booking: null });
  const [slotDialog, setSlotDialog] = useState({ open: false, slot: null, action: null });
  const [addSlotDialog, setAddSlotDialog] = useState(false);
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchData = () => {
    fetch(`${API_BASE}/bookings`)
      .then(res => res.json())
      .then(data => {
        const bookingsData = Array.isArray(data) ? data : [];
        setBookings(bookingsData);
        setStats(prev => ({
          ...prev,
          totalBookings: bookingsData.length,
          activeBookings: bookingsData.filter(b => b.status === 'active' || b.status === 'checked_in').length
        }));
      })
      .catch(() => {
        setBookings([]);
        setStats(prev => ({
          ...prev,
          totalBookings: 0,
          activeBookings: 0
        }));
        setSnackbar({ open: true, message: 'Failed to fetch bookings data.', severity: 'error' });
      });

    fetch(`${API_BASE}/slots`)
      .then(res => res.json())
      .then(data => {
        const slotsData = Array.isArray(data) ? data : [];
        setSlots(slotsData);
        setStats(prev => ({
          ...prev,
          availableSlots: slotsData.filter(s => !s.is_occupied).length,
          occupiedSlots: slotsData.filter(s => s.is_occupied).length
        }));
      })
      .catch(() => {
        setSlots([]);
        setStats(prev => ({
          ...prev,
          availableSlots: 0,
          occupiedSlots: 0
        }));
        setSnackbar({ open: true, message: 'Failed to fetch slots data.', severity: 'error' });
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (is_occupied) => {
    return is_occupied ? 'error' : 'success';
  };

  const formatDateTime = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const handleCancelBooking = async (booking) => {
    setActionLoading(true);
    try {
      await fetch(`${API_BASE}/bookings/${booking.id}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to cancel booking.', severity: 'error' });
    } finally {
      setActionLoading(false);
      setCancelDialog({ open: false, booking: null });
    }
  };

  const handleSlotOccupancy = async (slot, occupied) => {
    setActionLoading(true);
    try {
      await fetch(`${API_BASE}/slots/${slot.id}/occupy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupied })
      });
      fetchData();
      setSnackbar({
        open: true,
        message: occupied ? 'Slot closed.' : 'Slot opened.',
        severity: 'success'
      });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update slot.', severity: 'error' });
    } finally {
      setActionLoading(false);
      setSlotDialog({ open: false, slot: null, action: null });
    }
  };

  const handleAddSlot = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_number: newSlotNumber })
      });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: 'Slot added!', severity: 'success' });
      setNewSlotNumber('');
      setAddSlotDialog(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Failed to add slot.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Helper: sort bookings by start time ascending
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );
  const now = new Date();

  // Upcoming: startTime > now, sorted ascending, limit 10
  const upcomingBookings = sortedBookings
    .filter(b => new Date(b.startTime) > now)
    .slice(0, 10);

  // Recent: startTime <= now, sorted descending, limit 10
  const recentBookings = [...sortedBookings]
    .filter(b => new Date(b.startTime) <= now)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .reverse()
    .slice(0, 10);

  return (
    <MainContainer maxWidth={false}>
      <MainContainer maxWidth="xl">
        {/* Page Title and Refresh */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 1, color: 'primary.main' }}>
            <LocalParking sx={{ mr: 1, fontSize: 32 }} />
            Smart Parking Admin Dashboard
          </Typography>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            sx={{ fontWeight: 600, borderRadius: 1 }}
          >
            Refresh
          </Button>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  <LocalParking sx={{ color: 'primary.main', mr: 1 }} /> Total Slots
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{slots.length}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {stats.availableSlots} available
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  <CheckCircle sx={{ color: 'success.main', mr: 1 }} /> Available Slots
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.availableSlots}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {slots.length ? ((stats.availableSlots / slots.length) * 100).toFixed(0) : 0}% free
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  <AccessTime sx={{ color: 'secondary.main', mr: 1 }} /> Total Bookings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.totalBookings}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {stats.activeBookings} currently active
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Add Slot Section */}
        <MainPaper elevation={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" color="primary" sx={{ flexGrow: 1, fontWeight: 600 }}>
              <Add sx={{ verticalAlign: 'middle', mr: 1 }} />
              Add New Slot
            </Typography>
            <TextField
              label="Slot Number"
              value={newSlotNumber}
              onChange={e => setNewSlotNumber(e.target.value)}
              size="small"
              sx={{ width: 200, borderRadius: 1, background: '#fff' }}
              disabled={actionLoading}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddSlot}
              disabled={!newSlotNumber || actionLoading}
              sx={{ borderRadius: 1, fontWeight: 600 }}
            >
              Add Slot
            </Button>
          </Box>
        </MainPaper>

        {/* Visual Slot Diagram */}
        <MainPaper elevation={3}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
            <LocalParking sx={{ mr: 1 }} /> Parking Slot Diagram
          </Typography>
          <Grid container spacing={2}>
            {slots.map((slot) => (
              <Grid item xs={6} sm={4} md={2} key={slot.id}>
                <SlotCard occupied={slot.is_occupied}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{slot.slot_number}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {slot.is_occupied ? 'Occupied' : 'Available'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {slot.is_occupied ? (
                      <Button
                        size="small"
                        color="secondary"
                        variant="outlined"
                        startIcon={<LockOpen />}
                        onClick={() => setSlotDialog({ open: true, slot, action: 'open' })}
                        disabled={actionLoading}
                        sx={{ borderRadius: 1, fontWeight: 600 }}
                      >
                        Open Slot
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Lock />}
                        onClick={() => setSlotDialog({ open: true, slot, action: 'close' })}
                        disabled={actionLoading}
                        sx={{
                          borderRadius: 1,
                          fontWeight: 600,
                          color: 'error.main',
                          borderColor: 'error.main',
                          '&:hover': {
                            borderColor: 'error.dark',
                            color: 'error.dark',
                          }
                        }}
                      >
                        Close Slot
                      </Button>
                    )}
                  </Box>
                </SlotCard>
              </Grid>
            ))}
          </Grid>
        </MainPaper>

        {/* Upcoming Bookings Table */}
        <MainPaper elevation={3}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
            <Upcoming sx={{ mr: 1, color: 'secondary.main' }} />
            Upcoming Bookings
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>RFID</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upcomingBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">No upcoming bookings.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {upcomingBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>#{booking.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {booking.name || booking.user?.name || 'Unknown'}
                        </Typography>
                        {booking.email || booking.user?.email ? (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {booking.email || booking.user?.email}
                          </Typography>
                        ) : null}
                      </Box>
                    </TableCell>
                    <TableCell>{booking.rfIdTagId}</TableCell>
                    <TableCell>{booking.slot ? booking.slot.slot_number : `Slot #${booking.slotId}`}</TableCell>
                    <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                    <TableCell>{formatDateTime(booking.endTime)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={booking.status}
                        color={booking.status === 'active' ? 'primary' : booking.status === 'checked_in' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {(booking.status === 'active' || booking.status === 'checked_in') && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => setCancelDialog({ open: true, booking })}
                          disabled={actionLoading}
                          sx={{ borderRadius: 1, fontWeight: 600 }}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MainPaper>

        {/* Recent Bookings Table */}
        <MainPaper elevation={3}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
            <History sx={{ mr: 1, color: 'primary.main' }} />
            Recent Bookings
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>RFID</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">No recent bookings.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>#{booking.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {booking.name || booking.user?.name || 'Unknown'}
                        </Typography>
                        {booking.email || booking.user?.email ? (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {booking.email || booking.user?.email}
                          </Typography>
                        ) : null}
                      </Box>
                    </TableCell>
                    <TableCell>{booking.rfIdTagId}</TableCell>
                    <TableCell>{booking.slot ? booking.slot.slot_number : `Slot #${booking.slotId}`}</TableCell>
                    <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                    <TableCell>{formatDateTime(booking.endTime)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={booking.status}
                        color={booking.status === 'active' ? 'primary' : booking.status === 'checked_in' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {(booking.status === 'active' || booking.status === 'checked_in') && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => setCancelDialog({ open: true, booking })}
                          disabled={actionLoading}
                          sx={{ borderRadius: 1, fontWeight: 600 }}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MainPaper>

        {/* All Bookings Section */}
        <MainPaper elevation={3}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
            <History sx={{ mr: 1, color: 'primary.main' }} />
            All Bookings
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>RFID</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">No bookings found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {sortedBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>#{booking.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {booking.name || booking.user?.name || 'Unknown'}
                        </Typography>
                        {booking.email || booking.user?.email ? (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {booking.email || booking.user?.email}
                          </Typography>
                        ) : null}
                      </Box>
                    </TableCell>
                    <TableCell>{booking.rfIdTagId}</TableCell>
                    <TableCell>{booking.slot ? booking.slot.slot_number : `Slot #${booking.slotId}`}</TableCell>
                    <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                    <TableCell>{formatDateTime(booking.endTime)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={booking.status}
                        color={booking.status === 'active' ? 'primary' : booking.status === 'checked_in' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {(booking.status === 'active' || booking.status === 'checked_in') && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => setCancelDialog({ open: true, booking })}
                          disabled={actionLoading}
                          sx={{ borderRadius: 1, fontWeight: 600 }}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MainPaper>
      </MainContainer>

      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, booking: null })}
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel booking #{cancelDialog.booking?.id}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, booking: null })} disabled={actionLoading} sx={{ borderRadius: 1 }}>
            No
          </Button>
          <Button
            onClick={() => handleCancelBooking(cancelDialog.booking)}
            color="error"
            variant="contained"
            disabled={actionLoading}
            sx={{ borderRadius: 1, fontWeight: 600 }}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Open/Close Slot Dialog */}
      <Dialog
        open={slotDialog.open}
        onClose={() => setSlotDialog({ open: false, slot: null, action: null })}
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle>{slotDialog.action === 'open' ? 'Open Slot' : 'Close Slot'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {slotDialog.action === 'open'
              ? `Are you sure you want to mark slot ${slotDialog.slot?.slot_number} as available?`
              : `Are you sure you want to mark slot ${slotDialog.slot?.slot_number} as occupied?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotDialog({ open: false, slot: null, action: null })} disabled={actionLoading} sx={{ borderRadius: 1 }}>
            No
          </Button>
          <Button
            onClick={() => handleSlotOccupancy(slotDialog.slot, slotDialog.action === 'close')}
            color={slotDialog.action === 'open' ? 'secondary' : 'warning'}
            variant="contained"
            disabled={actionLoading}
            sx={{ borderRadius: 1, fontWeight: 600 }}
          >
            Yes, {slotDialog.action === 'open' ? 'Open Slot' : 'Close Slot'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ borderRadius: 1 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainContainer>
  );
};

export default AdminPage;
