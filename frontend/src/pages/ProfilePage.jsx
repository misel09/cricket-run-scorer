import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Button,
} from '@mui/material';
import {
  AccountCircle,
  SportsCricket,
  EmojiEvents,
  Star,
  Email,
  PhoneAndroid,
  Cake,
  Home,
  Wc,
  Group,
  PersonAdd,
  PhotoCamera, // Add this import
  ArrowBack,
} from '@mui/icons-material';

const playingRoles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper'];
const battingStyles = ['Right-hand bat', 'Left-hand bat'];
const bowlingStyles = ['Right-arm fast', 'Left-arm fast', 'Right-arm spin', 'Left-arm spin'];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const fileInputRef = useRef(null);

  // For selection fields
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    playingRole: '',
    battingStyle: '',
    bowlingStyle: '',
    gender: '',
    dob: '',
    address: '',
    matchesPlayed: 0,
  });

  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    if (!email) {
      setUser({
        name: 'Guest User',
        email: 'guest@email.com',
        mobile: '',
        gender: '',
        playingRole: '',
        battingStyle: '',
        bowlingStyle: '',
        dob: '',
        address: '',
        followers: 0,
        following: 0,
        matchesPlayed: 0,
      });
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/user/${encodeURIComponent(email)}`)
      .then(res => {
        if (!res.ok) throw new Error('User fetch failed');
        return res.json();
      })
      .then(data => {
        setUser({
          ...data,
          gender: data.gender || '',
          playingRole: data.playingRole || '',
          battingStyle: data.battingStyle || '',
          bowlingStyle: data.bowlingStyle || '',
          dob: data.dob || '',
          address: data.address || '',
          followers: data.followers || 0,
          following: data.following || 0,
          matchesPlayed: data.matchesPlayed || 0,
        });
        setForm({
          playingRole: data.playingRole || '',
          battingStyle: data.battingStyle || '',
          bowlingStyle: data.bowlingStyle || '',
          gender: data.gender || '',
          dob: data.dob || '',
          address: data.address || '',
        });
        if (data.profilePic) setProfilePic(data.profilePic);
        setLoading(false);
      })
      .catch(() => {
        setUser({
          name: 'Guest User',
          email: 'guest@email.com',
          mobile: '',
          gender: '',
          playingRole: '',
          battingStyle: '',
          bowlingStyle: '',
          dob: '',
          address: '',
          followers: 0,
          following: 0,
          matchesPlayed: 0,
        });
        setLoading(false);
      });
  }, [email]);

  // Optionally, load profilePic from user data if backend supports it
  useEffect(() => {
    // If user has profilePic in backend, setProfilePic(data.profilePic)
    // For now, just keep it local
  }, [email]);

  const handleEditToggle = () => {
    if (edit) {
      setForm({
        playingRole: user?.playingRole || '',
        battingStyle: user?.battingStyle || '',
        bowlingStyle: user?.bowlingStyle || '',
        gender: user?.gender || '',
        dob: user?.dob || '',
        address: user?.address || '',
        matchesPlayed: user?.matchesPlayed || 0,
      });
    }
    setEdit((prev) => !prev);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/user/${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update');
      await res.json();
      setUser((prev) => ({ ...prev, ...form }));
      setEdit(false);
    } catch (err) {
      alert('Failed to save changes');
    }
  };

  const handleAvatarClick = () => {
    if (!edit) return; // Only allow changing in edit mode
    fileInputRef.current.click();
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result;
        setProfilePic(base64);

        // Send to backend
        await fetch(`http://localhost:5000/user/${encodeURIComponent(user.email)}/profile-pic`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profilePic: base64 }),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'linear-gradient(120deg, #f5f7fa 60%, #e0e7ff 100%)',
      py: 4,
      px: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Paper
        elevation={6}
        sx={{
          maxWidth: 750,
          width: '100%',
          mx: 'auto',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          background: 'rgba(255,255,255,0.98)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: '#fff',
            px: { xs: 2, sm: 5 },
            py: { xs: 3, sm: 4 },
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            position: 'relative',
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)',
          }}
        >
          {/* Back button at the left of the banner */}
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            sx={{
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,      // smaller font
              minWidth: 32,      // smaller width
              px: 0.5,           // less horizontal padding
              height: 32,        // smaller height
              position: 'absolute',
              left: 12,
              top: 12,
              zIndex: 10,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
            onClick={() => navigate(-1)}
          >
          </Button>

          {/* The rest of your banner content */}
          <Box sx={{ position: 'relative', display: 'inline-block', ml: 8 }}>
            <Avatar
              sx={{
                width: { xs: 70, sm: 100 },
                height: { xs: 70, sm: 100 },
                bgcolor: '#fff',
                color: 'primary.main',
                border: '4px solid #fff',
                boxShadow: '0 2px 12px #0002',
                fontSize: 60,
                cursor: edit ? 'pointer' : 'default',
                transition: 'box-shadow 0.2s',
                '&:hover': edit ? { boxShadow: '0 0 0 4px #1976d233' } : {},
              }}
              src={profilePic || undefined}
              onClick={handleAvatarClick}
            >
              {!profilePic && <AccountCircle fontSize="inherit" />}
            </Avatar>
            {edit && !profilePic && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  minWidth: 0,
                  width: 140,
                  height: 32,
                  borderRadius: 2,
                  position: 'absolute',
                  bottom: -40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                  p: 0,
                  boxShadow: 2,
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                  fontSize: 13,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
                onClick={handleAvatarClick}
                startIcon={<PhotoCamera sx={{ fontSize: 20, color: '#fff' }} />}
              >
                Add Profile
              </Button>
            )}
            {edit && profilePic && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  minWidth: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  zIndex: 2,
                  p: 0,
                  boxShadow: 2,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
                onClick={handleAvatarClick}
              >
                <PhotoCamera sx={{ fontSize: 20, color: '#fff' }} />
              </Button>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleProfilePicChange}
            />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : user?.name}
              <Star sx={{ color: '#FFD700', fontSize: 22, ml: 1 }} />
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.95, fontWeight: 500 }}>
              {user?.playingRole || 'Cricket Player'}
            </Typography>
            <Chip
              label="Verified"
              size="small"
              sx={{
                bgcolor: '#fff',
                color: 'primary.main',
                fontWeight: 600,
                mt: 1,
                fontSize: 12,
                boxShadow: '0 2px 8px #0001',
              }}
            />
          </Box>
        </Box>

        {/* Main Info Sections */}
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          {/* Followers & Following cards */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            mb: 3,
          }}>
            <Paper
              elevation={3}
              sx={{
                minWidth: 140,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                boxShadow: '0 2px 12px #0001',
                bgcolor: '#fffbe7',
              }}
            >
              <Group sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} /> {/* Followers icon */}
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {user?.followers ?? 0}
              </Typography>
              <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: 15 }}>
                Followers
              </Typography>
            </Paper>
            <Paper
              elevation={3}
              sx={{
                minWidth: 140,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                boxShadow: '0 2px 12px #0001',
                bgcolor: '#e7f6ff',
              }}
            >
              <PersonAdd sx={{ color: '#2196f3', fontSize: 32, mb: 1 }} /> {/* Following icon */}
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {user?.following ?? 0}
              </Typography>
              <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: 15 }}>
                Following
              </Typography>
            </Paper>
          </Box>
          <Grid container spacing={5} direction="column">
            {/* Personal Information */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: '#f8fafc',
                  borderRadius: 3,
                  minHeight: 240,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px #0001',
                  textAlign: 'left',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: 'primary.main',
                    textAlign: 'center',
                  }}
                >
                  Personal Information
                </Typography>
                {/* Each field: icon and title on the same line, value below */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircle sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Name</Typography>
                  </Box>
                  <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.name || 'Not specified'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Email</Typography>
                  </Box>
                  <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.email || 'Not specified'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneAndroid sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Contact</Typography>
                  </Box>
                  <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.mobile || 'Not specified'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Wc sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Gender</Typography>
                  </Box>
                  {edit ? (
                    <FormControl size="small" sx={{ ml: 4, minWidth: 180 }} fullWidth>
                      {/* Removed InputLabel */}
                      <Select
                        name="gender"
                        value={form.gender || ''}
                        onChange={handleFormChange}
                        displayEmpty
                        sx={{ background: "#fff", borderRadius: 1 }}
                      >
                        <MenuItem value=""><em>Not specified</em></MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.gender || 'Not specified'}</Typography>
                  )}
                </Box>
                <Divider />
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Cake sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Date of Birth</Typography>
                  </Box>
                  {edit ? (
                    <Box sx={{ ml: 4 }}>
                      <input
                        type="date"
                        name="dob"
                        value={form.dob || ''}
                        onChange={handleFormChange}
                        style={{
                          fontSize: 16,
                          padding: 6,
                          borderRadius: 6,
                          border: '1px solid #ccc',
                          background: "#fff",
                          width: 180
                        }}
                      />
                    </Box>
                  ) : (
                    <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.dob || 'Not specified'}</Typography>
                  )}
                </Box>
                <Divider />
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Home sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Address</Typography>
                  </Box>
                  {edit ? (
                    <Box sx={{ ml: 4 }}>
                      <input
                        type="text"
                        name="address"
                        value={form.address || ''}
                        onChange={handleFormChange}
                        placeholder="Enter your address"
                        style={{
                          fontSize: 16,
                          padding: 6,
                          borderRadius: 6,
                          border: '1px solid #ccc',
                          background: "#fff",
                          width: 220
                        }}
                      />
                    </Box>
                  ) : (
                    <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.address || 'Not specified'}</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            {/* Cricket Information */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: '#f8fafc',
                  borderRadius: 3,
                  minHeight: 240,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px #0001',
                  textAlign: 'left',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: 'primary.main',
                    textAlign: 'center',
                  }}
                >
                  Cricket Information
                </Typography>
                {/* Playing Role */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsCricket sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Playing Role</Typography>
                  </Box>
                  {edit ? (
                    <FormControl size="small" sx={{ ml: 4, minWidth: 180 }} fullWidth>
                      {/* Removed InputLabel */}
                      <Select
                        name="playingRole"
                        value={form.playingRole}
                        onChange={handleFormChange}
                        sx={{ background: "#fff", borderRadius: 1 }}
                        displayEmpty
                      >
                        <MenuItem value=""><em>Not specified</em></MenuItem>
                        {playingRoles.map((role) => (
                          <MenuItem key={role} value={role}>{role}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.playingRole || 'Not specified'}</Typography>
                  )}
                </Box>
                <Divider />
                {/* Batting Style */}
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsCricket sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Batting Style</Typography>
                  </Box>
                  {edit ? (
                    <FormControl size="small" sx={{ ml: 4, minWidth: 180 }} fullWidth>
                      {/* Removed InputLabel */}
                      <Select
                        name="battingStyle"
                        value={form.battingStyle}
                        onChange={handleFormChange}
                        sx={{ background: "#fff", borderRadius: 1 }}
                        displayEmpty
                      >
                        <MenuItem value=""><em>Not specified</em></MenuItem>
                        {battingStyles.map((style) => (
                          <MenuItem key={style} value={style}>{style}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.battingStyle || 'Not specified'}</Typography>
                  )}
                </Box>
                <Divider />
                {/* Bowling Style */}
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsCricket sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Bowling Style</Typography>
                  </Box>
                  {edit ? (
                    <FormControl size="small" sx={{ ml: 4, minWidth: 180 }} fullWidth>
                      {/* Removed InputLabel */}
                      <Select
                        name="bowlingStyle"
                        value={form.bowlingStyle}
                        onChange={handleFormChange}
                        sx={{ background: "#fff", borderRadius: 1 }}
                        displayEmpty
                      >
                        <MenuItem value=""><em>Not specified</em></MenuItem>
                        {bowlingStyles.map((style) => (
                          <MenuItem key={style} value={style}>{style}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.bowlingStyle || 'Not specified'}</Typography>
                  )}
                </Box>
                <Divider />
                {/* Matches Played */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEvents sx={{ color: 'primary.main' }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>Matches Played</Typography>
                  </Box>
                  <Typography sx={{ ml: 4, fontSize: 16 }}>{user?.matchesPlayed ?? 'Not specified'}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          {/* Edit Button at the bottom */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            {edit ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mr: 2 }}
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleEditToggle}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleEditToggle}
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
