import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Fade, Snackbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TournamentPage = () => {
  const [name, setName] = useState('');
  const [ground, setGround] = useState('');
  const [teams, setTeams] = useState('');
  const [matches, setMatches] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const navigate = useNavigate();

  const handleIconChange = e => {
    const file = e.target.files[0];
    setIconFile(file);
    if (file) {
      setIconPreview(URL.createObjectURL(file));
    } else {
      setIconPreview(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      setDateError('Start date cannot be in the past');
      return;
    }
    if (end < today) {
      setDateError('End date cannot be in the past');
      return;
    }
    if (end < start) {
      setDateError('End date must be after start date');
      return;
    }

    setDateError('');

    try {
      const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
      const userEmail = localStorage.getItem('userEmail'); // Assuming the user email is stored in localStorage
      const formData = new FormData();
      formData.append('name', name);
      formData.append('ground', ground);
      formData.append('teams', teams);
      formData.append('matches', matches);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('createdByEmail', userEmail);
      if (iconFile) {
        formData.append('icon', iconFile);
      }

      await axios.post('http://192.168.125.42:5000/api/tournament/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSnackbarOpen(true);

      // Reset only the form fields (star card fields)
      setName('');
      setGround('');
      setTeams('');
      setMatches('');
      setStartDate('');
      setEndDate('');
      setDateError('');
      setIconFile(null);
      setIconPreview(null);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert('Error creating tournament');
      }
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100dvh',
        bgcolor: 'linear-gradient(120deg, #e3f2fd 0%, #f5f7fa 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 0, sm: 4 },
        overflow: 'hidden',
      }}
    >

        <Fade in timeout={700}>
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 4,
              width: { xs: '96vw', sm: 400 },
              maxWidth: 420,
              maxHeight: { xs: '95dvh', sm: 'auto' },
              boxShadow: '0 8px 32px 0 #1976d233',
              background: 'linear-gradient(135deg, #fffde7 0%, #e3f2fd 100%)',
              position: 'relative',
              overflow: 'auto',
            }}
          >
            {/* Back Button at top-left of card */}
            <Button
              onClick={() => navigate(-1)}
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                minWidth: 0,
                p: 1,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 2px 8px #1976d233',
                zIndex: 100,
                color: '#1976d2',
                border: '2px solid red',
                '&:hover': {
                  background: '#e3f2fd',
                },
              }}
            >
              <ArrowBackIcon />
            </Button>
            {/* Star Icon and rest of card */}
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: 900,
                textAlign: 'center',
                color: '#1976d2',
                letterSpacing: 1,
                textShadow: '0 2px 8px #1976d233',
              }}
            >
              Create Tournament
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, position: 'relative' }}>
              <label
                htmlFor="tournament-icon-upload"
                style={{
                  cursor: 'pointer',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #ffb300',
                  width: 80,
                  height: 80,
                  background: '#fffde7',
                  position: 'relative',
                  boxShadow: '0 4px 24px 0 #ffb30033, 0 0 0 8px #fffde799',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="Tournament Icon Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <CameraAltIcon sx={{ color: '#ffb300', fontSize: 32 }} />
                )}
                <input
                  id="tournament-icon-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleIconChange}
                />
              </label>
              <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>
                Add Tournament Icon
              </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Tournament Name"
                variant="outlined"
                fullWidth
                required
                value={name}
                onChange={e => setName(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  style: { background: '#fff', borderRadius: 8 },
                }}
              />
              <TextField
                label="Ground"
                variant="outlined"
                fullWidth
                required
                value={ground}
                onChange={e => setGround(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  style: { background: '#fff', borderRadius: 8 },
                }}
              />
              <TextField
                label="No. of Teams"
                variant="outlined"
                fullWidth
                required
                type="number"
                inputProps={{ min: 2 }}
                value={teams}
                onChange={e => setTeams(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  style: { background: '#fff', borderRadius: 8 },
                }}
              />
              <TextField
                label="No. of Matches"
                variant="outlined"
                fullWidth
                required
                type="number"
                inputProps={{ min: 1 }}
                value={matches}
                onChange={e => setMatches(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  style: { background: '#fff', borderRadius: 8 },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <TextField
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  fullWidth
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    style: { background: '#fff', borderRadius: 8 },
                  }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  variant="outlined"
                  fullWidth
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    style: { background: '#fff', borderRadius: 8 },
                  }}
                />
              </Box>
              {dateError && (
                <Typography
                  color="error"
                  sx={{
                    mb: 2,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: 0.5,
                  }}
                >
                  {dateError}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  fontWeight: 700,
                  py: 1.2,
                  borderRadius: 3,
                  fontSize: 17,
                  background: 'linear-gradient(90deg, #ffb300 0%, #1976d2 100%)',
                  color: '#fff',
                  boxShadow: '0 2px 8px #1976d233',
                  letterSpacing: 1,
                  mt: 1,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1976d2 0%, #ffb300 100%)',
                  },
                }}
              >
                Create Tournament
              </Button>
            </form>
          </Paper>
        </Fade>
    
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="Tournament created successfully!"
      />
    </Box>
  );
};

export default TournamentPage;