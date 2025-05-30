import React, { useState } from 'react';
import {
  Container, Grid, Paper, Typography, TextField, Button,
  Box, Stepper, Step, StepLabel, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  FormHelperText, CircularProgress, Divider, Alert, Snackbar
} from '@mui/material';
import {
  DirectionsCar, CalendarToday, Person, Email, Check,
  LocalParking, Payment
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { styled } from '@mui/material/styles';

const API_BASE = 'https://okarusuvo.com/parking';

const steps = ['Select Booking Time', 'Enter Personal & RFID Details', 'Confirm Booking'];

const SlotCard = styled(Card)(({ theme, selected }) => ({
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'border 0.2s, box-shadow 0.2s',
  boxShadow: selected ? theme.shadows[4] : theme.shadows[1],
  '&:hover': {
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: theme.shadows[4],
  },
  width: 90,
  height: 90,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  margin: theme.spacing(0.5),
}));

const MainPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  padding: theme.spacing(4),
}));

const MainContainer = styled(Container)(({ theme }) => ({
  background: theme.palette.grey[100],
  minHeight: '100vh',
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const BookingPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    uid: '',
    slotId: '',
    startTime: null,
    endTime: null,
  });
  const [errors, setErrors] = useState({});
  const [openConfirm, setOpenConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const searchSlots = async () => {
    setLoading(true);
    setSlots([]);
    setForm({ ...form, slotId: '' });
    try {
      const response = await fetch(`${API_BASE}/slots/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: form.startTime?.toISOString(),
          endTime: form.endTime?.toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch slots');
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load available slots. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleDateChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleSlotSelect = (slotId) => {
    setForm({ ...form, slotId: Number(slotId) });
    if (errors.slotId) setErrors({ ...errors, slotId: '' });
  };

  const validateStep = () => {
    const newErrors = {};
    if (activeStep === 0) {
      if (!form.startTime) newErrors.startTime = 'Start time is required';
      if (!form.endTime) newErrors.endTime = 'End time is required';
      if (form.startTime && form.endTime && form.startTime >= form.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
      if (!form.slotId) newErrors.slotId = 'Please select a parking slot';
    } else if (activeStep === 1) {
      if (!form.name.trim()) newErrors.name = 'Name is required';
      if (!form.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
      if (!form.uid.trim()) newErrors.uid = 'RFID Tag UID is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!form.startTime || !form.endTime || form.startTime >= form.endTime) {
        validateStep();
        return;
      }
      await searchSlots();
      return;
    }
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        setOpenConfirm(true);
      } else {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const bookingRes = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          uid: form.uid,
          slotId: form.slotId,
          rfIdTagId: form.uid,
          startTime: form.startTime.toISOString(),
          endTime: form.endTime.toISOString(),
        }),
      });
      if (!bookingRes.ok) throw new Error('Failed to create booking');
      setBookingSuccess(true);
      setSnackbar({
        open: true,
        message: 'Booking successful! Check your email for confirmation.',
        severity: 'success'
      });
      setTimeout(() => {
        setForm({
          name: '',
          email: '',
          uid: '',
          slotId: '',
          startTime: null,
          endTime: null,
        });
        setActiveStep(0);
        setSlots([]);
      }, 3000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Booking failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
      setOpenConfirm(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
              <LocalParking color="primary" sx={{ verticalAlign: 'middle', mr: 1, fontSize: 28 }} />
              Select Booking Time
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Start Time"
                    value={form.startTime}
                    onChange={(newValue) => handleDateChange('startTime', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.startTime}
                        helperText={errors.startTime}
                        required
                        sx={{ background: '#fff' }}
                      />
                    )}
                    minDateTime={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="End Time"
                    value={form.endTime}
                    onChange={(newValue) => handleDateChange('endTime', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.endTime}
                        helperText={errors.endTime}
                        required
                        sx={{ background: '#fff' }}
                      />
                    )}
                    minDateTime={form.startTime || new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={searchSlots}
                  disabled={loading || !form.startTime || !form.endTime || form.startTime >= form.endTime}
                  sx={{
                    mb: 2,
                    height: '56px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 1,
                    width: { xs: '100%', sm: 'auto' }
                  }}
                  fullWidth={true}
                >
                  {loading ? 'Searching...' : 'Search Available Slots'}
                </Button>
              </Grid>
            </Grid>
            {slots.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
                  Select a slot
                </Typography>
                <Grid container spacing={2}>
                  {slots.map((slot) => (
                    <Grid item xs={6} sm={4} md={3} key={slot.id}>
                      <SlotCard
                        selected={form.slotId === slot.id}
                        onClick={() => handleSlotSelect(slot.id)}
                        elevation={form.slotId === slot.id ? 4 : 1}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {slot.slot_number}
                        </Typography>
                        {form.slotId === slot.id && (
                          <Check color="primary" sx={{ mt: 1, fontSize: 28 }} />
                        )}
                      </SlotCard>
                    </Grid>
                  ))}
                </Grid>
                {errors.slotId && (
                  <FormHelperText error sx={{ mt: 1 }}>{errors.slotId}</FormHelperText>
                )}
              </Box>
            )}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">Loading available slots...</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                onClick={() => {
                  if (form.slotId) {
                    setActiveStep(activeStep + 1);
                  } else {
                    setErrors({ ...errors, slotId: 'Please select a parking slot' });
                  }
                }}
                sx={{ mt: 1, ml: 1, minWidth: 120, borderRadius: 1, fontWeight: 600 }}
                disabled={!form.slotId}
              >
                Next
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
              <Person color="primary" sx={{ verticalAlign: 'middle', mr: 1, fontSize: 28 }} />
              Personal & RFID Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="name"
                  name="name"
                  label="Full Name"
                  fullWidth
                  variant="outlined"
                  value={form.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{
                    startAdornment: <Person color="action" sx={{ mr: 1 }} />
                  }}
                  sx={{ background: '#fff' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="email"
                  name="email"
                  label="Email Address"
                  fullWidth
                  variant="outlined"
                  value={form.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: <Email color="action" sx={{ mr: 1 }} />
                  }}
                  sx={{ background: '#fff' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="uid"
                  name="uid"
                  label="RFID Tag UID"
                  fullWidth
                  variant="outlined"
                  value={form.uid}
                  onChange={handleChange}
                  error={!!errors.uid}
                  helperText={errors.uid || 'Scan or enter your RFID tag UID'}
                  InputProps={{
                    startAdornment: <LocalParking color="action" sx={{ mr: 1 }} />
                  }}
                  sx={{ background: '#fff' }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                onClick={handleBack}
                sx={{ mt: 1, ml: 1, borderRadius: 1 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 1, ml: 1, borderRadius: 1, fontWeight: 600 }}
              >
                Next
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
              <CalendarToday color="primary" sx={{ verticalAlign: 'middle', mr: 1, fontSize: 28 }} />
              Booking Summary
            </Typography>
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 1, boxShadow: 1 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{form.name}</Typography>
                    <Typography variant="body2">{form.email}</Typography>
                    <Typography variant="body2">RFID: {form.uid}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Parking Details</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {slots.find(s => s.id === form.slotId)?.slot_number || form.slotId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Check-in</Typography>
                    <Typography variant="body1">
                      {form.startTime?.toLocaleString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Check-out</Typography>
                    <Typography variant="body1">
                      {form.endTime?.toLocaleString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                    <Typography variant="body1">
                      {form.startTime && form.endTime
                        ? `${Math.round((form.endTime - form.startTime) / (1000 * 60 * 60))} hours`
                        : '--'
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 1 }}>
              You will receive a confirmation email with your booking details.
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button
                onClick={handleBack}
                sx={{ mt: 1, ml: 1, borderRadius: 1 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ mt: 1, ml: 1, borderRadius: 1, fontWeight: 600 }}
              >
                Confirm & Book
              </Button>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <MainContainer maxWidth={false}>
      <MainPaper elevation={3} sx={{ maxWidth: 700, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: 800, letterSpacing: 1 }}>
          <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle', fontSize: 36 }} />
          Smart Parking Reservation
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
          Reserve your parking spot in advance and enjoy seamless parking.
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {bookingSuccess ? (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
              <Check sx={{ fontSize: 36, mb: 1 }} />
              Booking Confirmed!
            </Typography>
            <Typography variant="body1" paragraph>
              Your parking slot {slots.find(s => s.id === form.slotId)?.slot_number || form.slotId} has been successfully reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              A confirmation has been sent to {form.email}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setBookingSuccess(false);
                setActiveStep(0);
              }}
              sx={{ mt: 2, borderRadius: 1, fontWeight: 600 }}
            >
              Book Another Spot
            </Button>
          </Box>
        ) : (
          <Box>
            {getStepContent(activeStep)}
          </Box>
        )}
      </MainPaper>
      <Dialog
        open={openConfirm}
        onClose={() => !submitting && setOpenConfirm(false)}
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle>Confirm Your Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to book Parking Slot {slots.find(s => s.id === form.slotId)?.slot_number || form.slotId}?
            This will reserve the spot from {form.startTime?.toLocaleString()} to {form.endTime?.toLocaleString()}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenConfirm(false)}
            disabled={submitting}
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <Payment />}
            sx={{ borderRadius: 1, fontWeight: 600 }}
          >
            {submitting ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

export default BookingPage;
