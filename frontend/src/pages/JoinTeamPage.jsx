import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';

const JoinTeamPage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');
  const [match, setMatch] = useState(null);
  const [selectTeamOpen, setSelectTeamOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const userEmail = localStorage.getItem('userEmail');
  const navigate = useNavigate();

  // Fetch user name from backend using email
  useEffect(() => {
    if (userEmail) {
      fetch(`http://localhost:5000/api/user/by-email/${userEmail}`)
        .then(res => res.json())
        .then(data => {
          if (data.name) setUserName(data.name);
        });
    }
  }, [userEmail]);

  // Step 1: Validate join code and fetch match info
  const handleValidateCode = async () => {
    if (!joinCode) {
      setMessage('Please enter join code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/matches/by-code/${joinCode}`);
      if (!res.ok) {
        setMessage('Invalid join code.');
        setLoading(false);
        return;
      }
      const matchData = await res.json();

      // Check if user already joined
      const alreadyJoined =
        matchData.teamAPlayers.some(p => p.email === userEmail) ||
        matchData.teamBPlayers.some(p => p.email === userEmail);

      if (alreadyJoined) {
        setMessage('You have already joined this match.');
        setLoading(false);
        return;
      }

      setMatch(matchData);
      setSelectTeamOpen(true);
      setMessage('');
    } catch {
      setMessage('Error validating join code.');
    }
    setLoading(false);
  };

  // Step 2: Join selected team
  const handleJoinTeam = async (team) => {
    if (!userName) {
      setMessage('User name not found. Please check your profile.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/matches/join-by-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          joinCode,
          playerName: userName,
          email: userEmail,
          team,
        }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        setMessage('Server error or invalid response.');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setMessage(data.message || 'Failed to join team.');
        setLoading(false);
        return;
      }
      setSelectTeamOpen(false);
      setMessage(data.message || `Joined ${team}`);
    } catch {
      setMessage('Failed to join team.');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          bgcolor: '#fff',
          boxShadow: 2,
          zIndex: 10,
          '&:hover': { bgcolor: '#e3f2fd' },
        }}
        aria-label="Back"
      >
        <ArrowBackIcon />
      </IconButton>

      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 4 },
          maxWidth: 400,
          width: '100%',
          borderRadius: 4,
          boxShadow: 6,
          background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56, mb: 1 }}>
            <SportsCricketIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
            Join a Cricket Match
          </Typography>
          <Typography sx={{ color: '#757575', fontSize: 15, textAlign: 'center' }}>
            Enter your join code to participate in a match.
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <TextField
          label="Join Code"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          fullWidth
          sx={{ mb: 2 }}
          inputProps={{ style: { letterSpacing: 2, fontWeight: 700, fontSize: 18, textAlign: 'center' } }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleValidateCode}
          sx={{ fontWeight: 700, py: 1.2, fontSize: 18, mb: 1 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={26} color="inherit" /> : 'Next'}
        </Button>
        {message && (
          <Alert severity={message.toLowerCase().includes('success') || message.toLowerCase().includes('joined') ? 'success' : 'error'} sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </Paper>

      {/* Team selection dialog */}
      <Dialog open={selectTeamOpen} onClose={() => setSelectTeamOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#1976d2' }}>
          Select Your Team
        </DialogTitle>
        <DialogContent>
          {match && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                {match.tournamentName || 'Friendly Match'}
              </Typography>
              <Typography sx={{ color: '#757575', fontSize: 15 }}>
                {match.teamA} vs {match.teamB}
              </Typography>
              <Typography sx={{ color: '#757575', fontSize: 14 }}>
                {match.ground} | {match.date}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              sx={{ minWidth: 120, fontWeight: 700, fontSize: 16 }}
              onClick={() => handleJoinTeam('teamA')}
              disabled={loading}
            >
              {match?.teamA}
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ minWidth: 120, fontWeight: 700, fontSize: 16 }}
              onClick={() => handleJoinTeam('teamB')}
              disabled={loading}
            >
              {match?.teamB}
            </Button>
          </Box>
          <Typography sx={{ textAlign: 'center', color: '#757575', fontSize: 14 }}>
            You are joining as: <b>{userName || userEmail}</b>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectTeamOpen(false)} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JoinTeamPage;