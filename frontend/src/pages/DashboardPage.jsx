import React, { useEffect, useState, useCallback } from 'react';
import {
  Avatar, Tooltip, Typography, Box, Button, Card, CardContent, TextField, InputAdornment, Snackbar, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import './DashboardPage.css';
import { SportsCricket, GroupAdd, Add } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // Add this import

const starCards = [
  {
    key: 'create',
    icon: <Add sx={{ fontSize: { xs: 32, sm: 48 }, mb: 1 }} />,
    title: 'Create New',
    button: 'Create',
  },
  {
    key: 'join',
    icon: <GroupAdd sx={{ fontSize: { xs: 32, sm: 48 }, mb: 1 }} />,
    title: 'Join',
    button: 'Join',
  },
  {
    key: 'mycricket',
    icon: <SportsCricket sx={{ fontSize: { xs: 32, sm: 48 }, mb: 1 }} />,
    title: 'My Cricket',
    button: 'View',
  },
];

const DashboardPage = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('players');
  const [matches, setMatches] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followMsg, setFollowMsg] = useState(''); // State for follow message
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [starCardIndex, setStarCardIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const email = localStorage.getItem('userEmail');
  const navigate = useNavigate();

  // Wrap fetchNotifications in useCallback
  const fetchNotifications = useCallback(() => {
    fetch(`http://192.168.125.42:5000/user/${encodeURIComponent(email)}/notifications`)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data.reverse() : [];
        setNotifications(arr);
      })
      .catch(() => setNotifications([]));
  }, [email]);

  const handleOpenNotifications = () => {
    setNotificationOpen(true);

    // 1. Mark all as read in backend
    fetch(`http://192.168.125.42:5000/user/${encodeURIComponent(email)}/notifications/markAllRead`, {
      method: 'POST'
    })
      .then(() => {
        // 2. Fetch notifications again to update their read status in UI
        fetchNotifications();
      })
      .catch(() => {
        // fallback: still fetch notifications
        fetchNotifications();
      });
  };


  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (!email) return;
    fetch(`http://192.168.125.42:5000/user/${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.profilePic) setProfilePic(data.profilePic);
        else setProfilePic(null);
      });
  }, [email]);

  useEffect(() => {
    if (search.trim()) {
      if (searchType === 'players') {
        fetch(`http://192.168.125.42:5000/search/users?name=${encodeURIComponent(search.trim())}`)
          .then(res => res.json())
          .then(data => {
            setMatches(Array.isArray(data) ? data : []);
          })
          .catch(() => {
            setMatches([]);
          });
      } else if (searchType === 'tournament') {
        fetch(`http://192.168.125.42:5000/search/tournaments?name=${encodeURIComponent(search.trim())}`)
          .then(res => res.json())
          .then(data => {
            console.log('Tournament search result:', data); // <-- Add this line
            setMatches(Array.isArray(data) ? data : []);
          })
          .catch(() => {
            setMatches([]);
          });
      } else if (searchType === 'ground') {
        fetch(`http://192.168.125.42:5000/search/tournamentsByGround?ground=${encodeURIComponent(search.trim())}`)
          .then(res => res.json())
          .then(data => {
            setMatches(Array.isArray(data) ? data : []);
          })
          .catch(() => {
            setMatches([]);
          });
      } else {
        setMatches([]);
      }
    } else {
      setMatches([]);
    }
  }, [search, searchType]);


  // Add this effect to reset followMsg and isFollowing when selectedPlayer changes
  useEffect(() => {
    setFollowMsg('');
    setIsFollowing(false);
    if (selectedPlayer && email) {
      fetch(`http://192.168.125.42:5000/user/${encodeURIComponent(email)}/isFollowing/${encodeURIComponent(selectedPlayer.email)}`)
        .then(res => res.json())
        .then(data => setIsFollowing(data.isFollowing))
        .catch(() => setIsFollowing(false));
    }
  }, [selectedPlayer, email]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleFollow = () => {
    if (!selectedPlayer || !email) return;
    fetch(`http://192.168.125.42:5000/user/${encodeURIComponent(email)}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followEmail: selectedPlayer.email }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFollowMsg(data.message || (data.unfollowed ? 'Unfollowed!' : 'You are now following this player!'));
          setSnackbarOpen(true);
          setIsFollowing(!data.unfollowed); // update button state
        } else if (data.message) {
          setFollowMsg(data.message);
          setSnackbarOpen(true);
        } else {
          setFollowMsg('Failed to follow/unfollow. Try again.');
          setSnackbarOpen(true);
        }
      })
      .catch(() => {
        setFollowMsg('Failed to follow/unfollow. Try again.');
        setSnackbarOpen(true);
      });
  };
  const handleOpenChat = () => {
    navigate('/chat');
  };

  const handleCreateClick = () => {
    navigate('/create');
  };

  // Add this function to handle star card button clicks
  const handleStarCardButtonClick = (key) => {
    if (key === 'create') {
      handleCreateClick();
    } else if (key === 'mycricket') {
      navigate('/cricket');
    } else if (key === 'join') {
      navigate('/join-team');
    }
  };

  useEffect(() => {
    if (snackbarOpen && !!followMsg) {
      const timer = setTimeout(() => setSnackbarOpen(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbarOpen, followMsg]);

  // Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 50 && starCardIndex > 0) setStarCardIndex(starCardIndex - 1); // swipe right
    if (diff < -50 && starCardIndex < starCards.length - 1) setStarCardIndex(starCardIndex + 1); // swipe left
    setTouchStartX(null);
  };

  return (
    <Box
      className="dashboard-container"
      sx={{
        minHeight: '100vh',
        maxHeight: '100vh',
        overflowY: 'auto',
        bgcolor: '#f5f7fa',
        px: { xs: 1, sm: 2, md: 4 },
      }}
    >
      {/* Welcome Banner */}
      <Box
        className="welcome-banner welcome-banner-top"
        sx={{
          textAlign: 'center',
          py: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          position: 'relative', // Add this for absolute positioning
        }}
      >
        {/* Bell icon at top right */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 18,
            zIndex: 10,
            display: 'flex',
            gap: 1,
          }}
        >
          {/* Chat icon button (left side) */}
          <Box
            sx={{
              cursor: 'pointer',
              color: '#009688',
              bgcolor: '#fff',
              borderRadius: '50%',
              p: 0.7,
              boxShadow: 2,
              '&:hover': { bgcolor: '#e0f2f1' },
            }}
            onClick={handleOpenChat}
          >
            <ChatBubbleOutlineIcon fontSize="medium" />
          </Box>
          {/* Notification bell icon (right side) */}
          <Box
            sx={{
              cursor: 'pointer',
              color: '#009688',
              bgcolor: '#fff',
              borderRadius: '50%',
              p: 0.7,
              boxShadow: 2,
              position: 'relative', // Needed for red dot
              '&:hover': { bgcolor: '#e0f2f1' },
            }}
            onClick={handleOpenNotifications}
          >
            <NotificationsNoneIcon fontSize="medium" />
          </Box>
        </Box>
        <Tooltip title="View Profile" arrow>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <Avatar
              src={profilePic || undefined}
              sx={{
                width: { xs: 70, sm: 110 },
                height: { xs: 70, sm: 110 },
                bgcolor: '#fff',
                color: 'primary.main',
                border: '4px solid #fff',
                boxShadow: '0 2px 12px #0002',
                fontSize: { xs: 80, sm: 180 },
                marginBottom: 2,
                mx: 'auto',
              }}
            >
              {!profilePic && <AccountCircle sx={{ fontSize: { xs: 80, sm: 180 } }} />}
            </Avatar>
          </Link>
        </Tooltip>
        <Typography variant="h4" className="welcome-message" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Welcome Back!
        </Typography>
        <Typography variant="body2" className="welcome-subtext" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
          Manage your matches, track your performance, and explore statistics.
        </Typography>
      </Box>

      {/* Search Bar below the welcome banner */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          mx: 'auto',
          mt: 2,
          mb: 2,
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder={`Search ${searchType}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: 1,
            fontSize: { xs: '0.95rem', sm: '1rem' },
          }}
          onFocus={() => setSearchActive(true)}
        />
      </Box>

      {/* Star Cards Section */}
      <Box
        className="star-cards-section"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'row' },
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'center' },
          mb: 2,
          width: '100%',
          maxWidth: 240 * 3,
          mx: 'auto',
          position: 'relative',
          minHeight: 180,
          userSelect: 'none',
          overflow: { xs: 'hidden', sm: 'visible' },
          gap: 2,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {starCards.map((card, idx) => (
          <Card
            key={card.key}
            className={`star-card ${card.key}-card`}
            sx={{
              flex: { xs: starCardIndex === idx ? '0 0 100%' : '0 0 0%', sm: '1 1 0%' },
              minWidth: { xs: starCardIndex === idx ? 120 : 0, sm: 120 },
              maxWidth: { xs: starCardIndex === idx ? 180 : 0, sm: 180 },
              mx: 'auto',
              boxShadow: 2,
              textAlign: 'center',
              display: { xs: starCardIndex === idx ? 'block' : 'none', sm: 'block' },
              transition: 'all 0.3s',
              py: 2.5,
              borderRadius: '50px',
              height: 150,
              justifyContent: 'center',
              alignItems: 'center',
              background: '#fff',
            }}
          >
            <CardContent sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              {React.cloneElement(card.icon, { sx: { fontSize: { xs: 24, sm: 32 }, mb: 0.5 } })}
              <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' }, mb: 0.5 }}>
                {card.title}
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 0.5, width: '90%', fontSize: '0.85rem', py: 0.5, borderRadius: 20 }}
                onClick={() => handleStarCardButtonClick(card.key)}
              >
                {card.button}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
      {/* 3 dots indicator for mobile only */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          justifyContent: 'center',
          alignItems: 'center',
          mt: 1,
          mb: 2,
          gap: 1.5,
        }}
      >
        {starCards.map((_, idx) => (
          <Box
            key={idx}
            sx={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              backgroundColor: starCardIndex === idx ? '#1976d2' : '#bdbdbd', // blue highlight for active
              border: starCardIndex === idx ? '2px solid #1976d2' : '2px solid #bdbdbd',
              boxShadow: starCardIndex === idx ? '0 0 0 2px #90caf9' : 'none', // subtle blue glow
              transition: 'background-color 0.2s, box-shadow 0.2s, border 0.2s',
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <Button
          component={Link}
          to="/profile"
          variant="outlined"
          sx={{
            color: 'black',
            borderColor: 'black',
            backgroundColor: 'white',
            mt: { xs: 1, sm: 0 },
            width: { xs: '100%', sm: 'auto' },
            '&:hover': { borderColor: 'black', backgroundColor: '#f5f5f5' },
          }}
        >
          My Profile
        </Button>
        <Button
          variant="contained"
          color="error"
          sx={{
            mt: { xs: 1, sm: 0 },
            width: { xs: '100%', sm: 'auto' },
          }}
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </Box>

      {/* Search Overlay - Fullscreen search active */}
      {searchActive && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: '#fff',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
            px: { xs: 1, sm: 0 },
          }}
        >
          {/* Top bar: Back button and search bar */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              mx: 'auto',
              pt: 2,
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 3000,
            }}
          >
            <Button
              onClick={() => {
                setSearchActive(false);
                setSearch(''); // Clear the search value when closing overlay
              }}
              startIcon={<ArrowBackIcon />}
              variant="contained"
              sx={{
                minWidth: 0,
                mr: 2,
                bgcolor: '#009688',
                color: 'blue',
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 2,
                px: 2,
                py: 1,
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  color: '#009688',
                  boxShadow: 4,
                },
              }}
            >
            </Button>
            <Box sx={{ flexGrow: 1, ml: 2 }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={`Search ${searchType}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  boxShadow: 1,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                }}
              />
            </Box>
          </Box>
          {/* Selection chips for search types */}
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 340 },
              mx: 'auto',
              mt: { xs: 1, sm: 0.5 },
              mb: 1,
              display: 'flex',
              justifyContent: { xs: 'flex-start', sm: 'flex-start' },
              gap: { xs: 1, sm: 0.3 },
              flexWrap: 'wrap',
              pl: { xs: 2, sm: 0 }, // Less left margin for better mobile look
            }}
          >
            <Box
              onClick={() => setSearchType('players')}
              sx={{
                cursor: 'pointer',
                px: { xs: 1.2, sm: 0.7 },
                py: { xs: 0.5, sm: 0.1 },
                borderRadius: 2,
                bgcolor: searchType === 'players' ? '#e0f2f1' : '#f5f5f5',
                color: '#009688',
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '0.85rem' },
                border: searchType === 'players' ? '1.5px solid #009688' : '1px solid transparent',
                transition: 'all 0.15s',
                minWidth: 0,
                textAlign: 'center',
                lineHeight: 1.5,
                boxShadow: searchType === 'players' ? '0 1px 3px #00968822' : 0,
                mb: { xs: 1, sm: 0 },
                '&:hover': {
                  bgcolor: '#e0f2f1',
                },
              }}
            >
              <span style={{ fontWeight: 700, marginLeft: 2 }}>Players</span>
            </Box>
            <Box
              onClick={() => setSearchType('tournament')}
              sx={{
                cursor: 'pointer',
                px: { xs: 1.2, sm: 0.7 },
                py: { xs: 0.5, sm: 0.1 },
                borderRadius: 2,
                bgcolor: searchType === 'tournament' ? '#e0f2f1' : '#f5f5f5',
                color: '#009688',
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '0.85rem' },
                border: searchType === 'tournament' ? '1.5px solid #009688' : '1px solid transparent',
                transition: 'all 0.15s',
                minWidth: 0,
                textAlign: 'center',
                lineHeight: 1.5,
                boxShadow: searchType === 'tournament' ? '0 1px 3px #00968822' : 0,
                mb: { xs: 1, sm: 0 },
                '&:hover': {
                  bgcolor: '#e0f2f1',
                },
              }}
            >
              <span style={{ fontWeight: 700, marginLeft: 2 }}>Tournament</span>
            </Box>
            <Box
              onClick={() => setSearchType('ground')}
              sx={{
                cursor: 'pointer',
                px: { xs: 1.2, sm: 0.7 },
                py: { xs: 0.5, sm: 0.1 },
                borderRadius: 2,
                bgcolor: searchType === 'ground' ? '#e0f2f1' : '#f5f5f5',
                color: '#009688',
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '0.85rem' },
                border: searchType === 'ground' ? '1.5px solid #009688' : '1px solid transparent',
                transition: 'all 0.15s',
                minWidth: 0,
                textAlign: 'center',
                lineHeight: 1.5,
                boxShadow: searchType === 'ground' ? '0 1px 3px #00968822' : 0,
                mb: { xs: 1, sm: 0 },
                '&:hover': {
                  bgcolor: '#e0f2f1',
                },
              }}
            >
              <span style={{ fontWeight: 700, marginLeft: 2 }}>Ground</span>
            </Box>
          </Box>
          {/* Player Detail Card */}
          {selectedPlayer ? (
            <Box
              sx={{
                width: '100%',
                maxWidth: 370,
                mx: 'auto',
                mt: 4,
                mb: 2,
                bgcolor: '#fff',
                borderRadius: 4,
                boxShadow: 6,
                overflow: 'hidden',
                p: 0,
                position: 'relative',
              }}
            >
              {/* Profile Image Section */}
              <Box
                sx={{
                  bgcolor: 'linear-gradient(180deg, #455a64 0%, #263238 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pt: 4,
                  pb: 2,
                  position: 'relative',
                }}
              >
                <Avatar
                  src={selectedPlayer.profilePic || undefined}
                  variant="square"
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#90a4ae',
                    fontSize: 64,
                    borderRadius: 3,
                    boxShadow: '0 4px 24px #26323844',
                  }}
                >
                  {!selectedPlayer.profilePic && <AccountCircle sx={{ fontSize: 100 }} />}
                </Avatar>
                {/* Example: Player type/role */}
                {/* Action icons row */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  {/* Only show follow/unfollow if not viewing own profile */}
                  {selectedPlayer.email !== email && (
                    <Button
                      sx={{
                        minWidth: 0,
                        width: 60,
                        height: 36,
                        p: 0,
                        bgcolor: isFollowing ? '#e0e0e0' : '#1976d2', // grey when following, blue when not
                        color: isFollowing ? '#757575' : '#fff',      // grey text when following, white when not
                        borderRadius: 2,
                        boxShadow: 1,
                        fontSize: 13,
                        textTransform: 'none',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          bgcolor: isFollowing ? '#bdbdbd' : '#1565c0', // darker grey or blue on hover
                        },
                        transition: 'width 0.2s',
                        fontWeight: 700,
                      }}
                      onClick={handleFollow}
                    >
                      {isFollowing ? (
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            width: '100%',
                            display: 'inline-block',
                            textAlign: 'center',
                          }}
                        >
                          Unfollow
                        </span>
                      ) : (
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            width: '100%',
                            display: 'inline-block',
                            textAlign: 'center',
                          }}
                        >
                          Follow
                        </span>
                      )}
                    </Button>
                  )}
                  <Button
                    sx={{
                      minWidth: 0,
                      p: 1.2,
                      bgcolor: '#fff',
                      color: '#009688',
                      borderRadius: '50%',
                      boxShadow: 1,
                      '&:hover': { bgcolor: '#e0f2f1' },
                    }}
                  >
                    <GroupAdd />
                  </Button>
                  <Button
                    sx={{
                      minWidth: 0,
                      p: 1.2,
                      bgcolor: '#fff',
                      color: '#009688',
                      borderRadius: '50%',
                      boxShadow: 1,
                      '&:hover': { bgcolor: '#e0f2f1' },
                    }}
                  >
                    <AccountCircle />
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 0, width: 60, height: 36, ml: 1 }}
                    onClick={() => navigate(`/chat?user=${selectedPlayer.email}`)}
                  >
                    Chat
                  </Button>
                </Box>
              </Box>
              {/* Info Section */}
              <Box sx={{ p: 3, pt: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedPlayer.name}
                </Typography>
                <Typography sx={{ color: '#757575', fontSize: 14, mb: 0.5 }}>
                  ({selectedPlayer.address || 'Location'})
                </Typography>
                <Typography sx={{ color: '#757575', fontSize: 14, mb: 1 }}>
                  {selectedPlayer.playingRole || 'Player'}
                </Typography>
                {/* Career Stats */}
                <Typography
                  sx={{
                    color: '#009688',
                    fontWeight: 700,
                    fontSize: 16,
                    mt: 2,
                    mb: 1,
                    letterSpacing: 1,
                  }}
                >
                  CAREER STATS
                </Typography>
                {/* PRO Lock Section */}
                <Button
                  variant="outlined"
                  sx={{ mt: 2, width: '100%' }}
                  onClick={() => setSelectedPlayer(null)}
                >
                  Back to Results
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              {/* Search Results */}
              {searchType === 'players' && search.trim() && matches.length > 0 && (
                <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', px: 1 }}>
                  {matches.map((user, idx) => (
                    <Card
                      key={idx}
                      sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2, py: 1, boxShadow: 1, cursor: 'pointer' }}
                      onClick={() => setSelectedPlayer(user)}
                    >
                      <Avatar
                        src={user.profilePic || undefined}
                        sx={{ width: 40, height: 40, mr: 2, bgcolor: '#e0e0e0', fontSize: 22 }}
                      >
                        {!user.profilePic && <AccountCircle fontSize="large" />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                            {user.name}
                          </Typography>
                          {user.verified === false && (
                            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                              UNVERIFIED
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <span style={{ color: '#757575' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#757575"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          </span>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                            {user.address || 'No address'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Button
                          component={Link}
                          to={`/teams/${user.email}`}
                          sx={{ color: '#009688', fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.9rem', sm: '1rem' } }}
                          size="small"
                          onClick={e => e.stopPropagation()}
                        >
                          Teams
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
              {(searchType === 'tournament' || searchType === 'ground') && search.trim() && matches.length > 0 && (
                <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', px: 1 }}>
                  {matches.map((tournament, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        px: 2,
                        py: 1.5,
                        boxShadow: 2,
                        cursor: 'pointer',
                        borderRadius: 3,
                        background: '#f9f9f9',
                        '&:hover': { boxShadow: 6, background: '#e3f2fd' },
                      }}
                      onClick={() => navigate(`/tournament/${tournament._id}`)}
                    >
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          mr: 2,
                          bgcolor: '#fffde7',
                          color: '#ffb300',
                          fontSize: 28,
                          border: '2px solid #ffb300',
                        }}
                      >
                        🏆
                      </Avatar>
                      <Box sx={{ flex: 1, textAlign: 'left' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.08rem', sm: '1.18rem' },
                            color: '#1976d2',
                            mb: 0.2,
                            textAlign: 'left',
                            letterSpacing: 0.5,
                          }}
                        >
                          {tournament.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#607d8b',
                            fontSize: { xs: '0.98rem', sm: '1.05rem' },
                            textAlign: 'left',
                          }}
                        >
                          Start: {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                        {/* Always show ground for both tournament and ground search */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#009688',
                            fontSize: { xs: '0.95rem', sm: '1.02rem' },
                            textAlign: 'left',
                            mt: 0.2,
                            fontWeight: 600,
                          }}
                        >
                          Ground: {tournament.ground}
                        </Typography>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* Snackbar for follow message */}
      <Snackbar
        open={snackbarOpen && !!followMsg}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }} // Centered
        sx={{
          '& .MuiSnackbarContent-root': {
            background: '#fff',
            color: '#009688',
            borderRadius: 3,
            boxShadow: '0 4px 24px #26323844',
            minWidth: 280,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 18,
            border: '2px solid #009688',
          }
        }}
      >
        <span>
          {followMsg}
        </span>
      </Snackbar>

      {/* Notification Dialog */}
      <Dialog open={notificationOpen} onClose={() => setNotificationOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent dividers>
          {notifications.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
              No notifications yet.
            </Typography>
          ) : (
            <List>
              {notifications.map((notif, idx) => (
                <ListItem key={idx}>
                  <ListItemAvatar>
                    <Avatar src={notif.followerProfilePic || undefined}>
                      {!notif.followerProfilePic && <AccountCircle />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${notif.followerName || notif.followerEmail} followed you`}
                    secondary={notif.date ? new Date(notif.date).toLocaleString() : ''}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* REMOVE the Join Team Section at the bottom */}
      {/* (Delete or comment out the following block)
      <Paper
        sx={{
          p: 4,
          maxWidth: 400,
          mx: 'auto',
          mt: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
          Join a Team
        </Typography>
        <TextField
          label="Enter Join Code"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleJoin}
          sx={{ fontWeight: 700, py: 1.2, fontSize: 18 }}
        >
          Join
        </Button>
        {message && (
          <Typography sx={{ mt: 2, color: message.includes('success') ? 'green' : 'red', textAlign: 'center' }}>
            {message}
          </Typography>
        )}
        <Button variant="outlined" href="/join-team">
          Go to Join Team Page
        </Button>
      </Paper>
      */}
    </Box>
  );
};

export default DashboardPage;
