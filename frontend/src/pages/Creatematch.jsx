import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  Fade,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useNavigate } from 'react-router-dom';

const Creatematch = () => {
  const navigate = useNavigate();
  const [matchData, setMatchData] = useState({
    teamA: '',
    teamB: '',
    ground: '',
    date: '',
    overs: '',
  });

  const [dialog, setDialog] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [copied, setCopied] = useState(false);
  const [teamAImg, setTeamAImg] = useState(null);
  const [teamBImg, setTeamBImg] = useState(null);

  const handleChange = e => {
    setMatchData({ ...matchData, [e.target.name]: e.target.value });
  };

  const handleCloseDialog = () => {
    setDialog({ ...dialog, open: false });
    
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const userEmail = localStorage.getItem('userEmail');
    try {
      const response = await fetch('http://192.168.125.42:5000/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...matchData,
          createdBy: userEmail,
          teamAIcon: teamAImg, // should be a base64 string like "data:image/png;base64,...."
          teamBIcon: teamBImg
        }),
      });
      if (response.ok) {
        const match = await response.json(); // get the created match object
        setDialog({
          open: true,
          message: (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: '#43a047', fontWeight: 700, mb: 1 }}>
                Match created successfully!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <Typography sx={{ color: '#1976d2', fontWeight: 600, mr: 1 }}>
                  Join Code:
                </Typography>
                <Typography sx={{ color: '#263238', fontWeight: 700, letterSpacing: 1, mr: 1 }}>
                  {match.joinCode}
                </Typography>
                <Tooltip title={copied ? "Copied!" : "Copy Join Code"} arrow>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: copied ? '#43a047' : '#e3f2fd',
                      color: copied ? '#fff' : '#1976d2',
                      '&:hover': { bgcolor: copied ? '#388e3c' : '#b3e5fc' },
                      p: 0.5,
                      transition: 'all 0.2s',
                    }}
                    onClick={() => {
                      if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(match.joinCode)
                          .then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1200);
                          })
                          .catch(() => fallbackCopy(match.joinCode));
                      } else {
                        fallbackCopy(match.joinCode);
                      }
                      function fallbackCopy(text) {
                        const input = document.createElement('input');
                        input.value = text;
                        document.body.appendChild(input);
                        input.select();
                        input.setSelectionRange(0, 99999);
                        document.execCommand('copy');
                        document.body.removeChild(input);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      }
                    }}
                    aria-label="Copy Join Code"
                  >
                    {copied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography sx={{ color: '#888', fontSize: 13, mt: 1 }}>
                Share this code with your team to join the match.
              </Typography>
              {/* Avatars for Team A and Team B */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Avatar src={teamAImg} sx={{ width: 40, height: 40 }}>{matchData.teamA?.[0] || 'A'}</Avatar>
                <Avatar src={teamBImg} sx={{ width: 40, height: 40 }}>{matchData.teamB?.[0] || 'B'}</Avatar>
              </Box>
            </Box>
          ),
          severity: 'success',
        });

        // Reset form fields after successful creation
        setMatchData({
          teamA: '',
          teamB: '',
          ground: '',
          date: '',
          overs: '',
        });
        setTeamAImg(null);
        setTeamBImg(null);
      }
    } catch (error) {
      console.error('Failed to create match:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: { xs: 'auto', sm: '100vh' },
        bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 1, sm: 0 },
        overflow: { xs: 'auto', sm: 'hidden' },
      }}
    >
      <Fade in timeout={700}>
        <Paper
          elevation={12}
          sx={{
            p: { xs: 2, sm: 5 },
            borderRadius: { xs: 3, sm: 7 },
            width: '100%',
            minWidth: { xs: '90vw', sm: 420 },
            maxWidth: 460,
            boxShadow: '0 8px 24px #b3c2d144',
            background: 'linear-gradient(120deg, #fff 70%, #e3f2fd 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative gradient blobs */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: -40, sm: -80 },
              right: { xs: -40, sm: -80 },
              width: { xs: 120, sm: 220 },
              height: { xs: 120, sm: 220 },
              bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #b3e5fc 100%)',
              opacity: 0.12,
              borderRadius: '50%',
              zIndex: 0,
              filter: 'blur(2px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: -30, sm: -60 },
              left: { xs: -30, sm: -60 },
              width: { xs: 80, sm: 160 },
              height: { xs: 80, sm: 160 },
              bgcolor: 'linear-gradient(135deg, #fffde7 0%, #e3f2fd 100%)',
              opacity: 0.10,
              borderRadius: '50%',
              zIndex: 0,
              filter: 'blur(1px)',
            }}
          />
          {/* Back Button */}
          <Tooltip title="Back">
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: '#fff',
                border: '2px solid #b3e5fc',
                boxShadow: '0 2px 8px #b3e5fc33',
                zIndex: 2,
                width: 40,
                height: 40,
                '&:hover': { bgcolor: '#e3f2fd' },
              }}
            >
              <ArrowBackIcon sx={{ color: '#1976d2', fontSize: 24 }} />
            </IconButton>
          </Tooltip>
          {/* Match Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, sm: 6 }, mb: 1 }}>
            <Avatar
              sx={{
                width: { xs: 70, sm: 110 },
                height: { xs: 70, sm: 110 },
                bgcolor: '#e3f2fd',
                color: '#1976d2',
                border: { xs: '4px solid #b3e5fc', sm: '6px solid #b3e5fc' },
                boxShadow: '0 4px 16px #b3e5fc22',
                mb: 1,
              }}
            >
              <SportsCricketIcon sx={{ fontSize: { xs: 38, sm: 75 } }} />
            </Avatar>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              textAlign: 'center',
              color: '#1976d2',
              letterSpacing: 1,
              mb: 0.5,
              mt: 1,
              textShadow: '0 2px 8px #b3e5fc22',
              fontSize: { xs: '1.5rem', sm: '2.2rem' },
            }}
          >
            Create Match
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: '#2196f3',
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: 15, sm: 18 },
              letterSpacing: 0.5,
            }}
          >
            Enter match details below
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: '#b3e5fc' }} />

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Team A: Avatar + Camera Icon + Name in one line */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Box sx={{ position: 'relative', width: 48, height: 48 }}>
                <Avatar
                  src={teamAImg}
                  sx={{ width: 48, height: 48, bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}
                >
                  {matchData.teamA?.[0] || 'A'}
                </Avatar>
                <label htmlFor="teamA-img-upload">
                  <IconButton
                    color="primary"
                    component="span"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: -6,
                      right: -6,
                      bgcolor: '#e3f2fd',
                      boxShadow: 1,
                      width: 28,
                      height: 28,
                      p: 0.5,
                      zIndex: 1,
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 18 }} />
                  </IconButton>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="teamA-img-upload"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setTeamAImg(ev.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </Box>
              <TextField
                label="Team A Name *"
                name="teamA"
                value={matchData.teamA}
                onChange={handleChange}
                required
                sx={{
                  flex: 1,
                  background: '#f8fafc',
                  borderRadius: 2,
                  boxShadow: '0 1px 4px #b3e5fc11',
                  input: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' }
                }}
                InputProps={{
                  style: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' },
                }}
                inputProps={{
                  maxLength: 30,
                }}
              />
            </Box>

            {/* Team B: Avatar + Camera Icon + Name in one line */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Box sx={{ position: 'relative', width: 48, height: 48 }}>
                <Avatar
                  src={teamBImg}
                  sx={{ width: 48, height: 48, bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}
                >
                  {matchData.teamB?.[0] || 'B'}
                </Avatar>
                <label htmlFor="teamB-img-upload">
                  <IconButton
                    color="primary"
                    component="span"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: -6,
                      right: -6,
                      bgcolor: '#e3f2fd',
                      boxShadow: 1,
                      width: 28,
                      height: 28,
                      p: 0.5,
                      zIndex: 1,
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 18 }} />
                  </IconButton>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="teamB-img-upload"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setTeamBImg(ev.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </Box>
              <TextField
                label="Team B Name *"
                name="teamB"
                value={matchData.teamB}
                onChange={handleChange}
                required
                sx={{
                  flex: 1,
                  background: '#f8fafc',
                  borderRadius: 2,
                  boxShadow: '0 1px 4px #b3e5fc11',
                  input: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' }
                }}
                InputProps={{
                  style: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' },
                }}
                inputProps={{
                  maxLength: 30,
                }}
              />
            </Box>
            <TextField
              label="Ground *"
              name="ground"
              value={matchData.ground}
              onChange={handleChange}
              fullWidth
              required
              sx={{
                mb: 2,
                background: '#f8fafc',
                borderRadius: 2,
                boxShadow: '0 1px 4px #b3e5fc11',
                input: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' }
              }}
              InputProps={{
                style: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' },
              }}
              inputProps={{
                maxLength: 30,
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="Date *"
                name="date"
                type="date"
                value={matchData.date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  flex: 1,
                  background: '#f8fafc',
                  borderRadius: 2,
                  boxShadow: '0 1px 4px #b3e5fc11',
                  input: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' }
                }}
                InputProps={{
                  style: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' },
                }}
              />
              <TextField
                label="Overs *"
                name="overs"
                type="number"
                value={matchData.overs}
                onChange={handleChange}
                required
                inputProps={{ min: 1, max: 100 }}
                sx={{
                  flex: 1,
                  background: '#f8fafc',
                  borderRadius: 2,
                  boxShadow: '0 1px 4px #b3e5fc11',
                  input: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' }
                }}
                InputProps={{
                  style: { fontWeight: 700, letterSpacing: 1, color: '#1976d2' },
                }}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                py: { xs: 1.2, sm: 1.7 },
                fontWeight: 900,
                fontSize: { xs: 18, sm: 22 },
                borderRadius: 4,
                letterSpacing: 1,
                background: 'linear-gradient(90deg, #b3e5fc 0%, #1976d2 100%)',
                color: '#fff',
                boxShadow: '0 4px 20px #b3e5fc44',
                mt: 2,
                textTransform: 'none',
                mb: 1,
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1976d2 0%, #b3e5fc 100%)',
                  boxShadow: '0 8px 32px #1976d244',
                  transform: 'scale(1.04)'
                },
              }}
            >
              Create Match
            </Button>
          </form>
        </Paper>
      </Fade>
      <Dialog
        open={dialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: dialog.severity === 'success' ? 'green' : 'red' }}>
          {dialog.severity === 'success' ? 'Success' : 'Error'}
        </DialogTitle>
        <DialogContent>
          {dialog.message}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Creatematch;