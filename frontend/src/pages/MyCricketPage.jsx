import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Paper, Typography, Divider, Avatar, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

const NAV_ITEMS = ['Matches', 'Tournaments', 'Teams'];
const SECTION_BTNS = ['My', 'Played', 'Created'];

const MyCricketPage = () => {
  const [activeNav, setActiveNav] = useState(0);
  const [activeSection, setActiveSection] = useState(0); // 0: My, 1: Played, 2: Created
  const [createdTournaments, setCreatedTournaments] = useState([]);
  const [createdMatches, setCreatedMatches] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMyMatches, setLoadingMyMatches] = useState(false);
  const [loadingCreatedMatches, setLoadingCreatedMatches] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);

  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail');

  // Filter tournaments for search
  const filteredTournaments = createdTournaments.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch created matches (for Created Matches section)
  useEffect(() => {
    if (email) {
      setLoadingCreatedMatches(true);
      fetch(`http://localhost:5000/api/matches/created-by/${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => setCreatedMatches(Array.isArray(data) ? data : []))
        .catch(() => setCreatedMatches([]))
        .finally(() => setLoadingCreatedMatches(false));
    }
  }, [email]);

  // Fetch tournaments created by user (for Created Tournaments section)
  useEffect(() => {
    if (activeNav === 1 && activeSection === 2) {
      setLoadingTournaments(true);
      const userEmail = localStorage.getItem('userEmail');
      axios.get(`http://localhost:5000/api/tournament?createdByEmail=${userEmail}`)
        .then(res => setCreatedTournaments(res.data))
        .catch(() => setCreatedTournaments([]))
        .finally(() => setLoadingTournaments(false));
    }
  }, [activeNav, activeSection]);

  // Fetch my matches (for My Matches section)
  useEffect(() => {
    if (activeNav === 0 && activeSection === 0 && email) {
      setLoadingMyMatches(true);
      fetch(`http://localhost:5000/api/matches/my-matches/${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => setMyMatches(Array.isArray(data) ? data : []))
        .catch(() => setMyMatches([]))
        .finally(() => setLoadingMyMatches(false));
    }
  }, [activeNav, activeSection, email]);

  const handleDeleteTournament = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/tournament/${id}`);
      setCreatedTournaments(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert('Failed to delete tournament');
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Combined Banner and NavBar with Red Background */}
      <div
        style={{
          width: '100%',
          background: '#b71c1c',
          color: '#fff',
          padding: 0,
          boxShadow: '0 2px 8px #0002',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          position: 'relative'
        }}
      >
        {/* Back Button styled like chat page (green circle with white arrow) */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            background: '#43b649',
            border: 'none',
            color: '#fff',
            fontSize: '1.15rem',
            cursor: 'pointer',
            padding: 0,
            width: 38,
            height: 38,
            borderRadius: '50%',
            boxShadow: '0 1px 4px #0002',
            zIndex: 2,
            lineHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Back"
        >
          {/* SVG chevron for a modern arrow style */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14.5 4.5L8 11L14.5 17.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Banner */}
        <div
          style={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.6rem',
            letterSpacing: 1,
            padding: '18px 0 10px 0',
          }}
        >
          My Cricket
        </div>
        {/* NavBar */}
        <nav
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            padding: '8px 0 0 0',
          }}
        >
          {NAV_ITEMS.map((label, idx) => (
            <span
              key={label}
              onClick={() => { setActiveNav(idx); setActiveSection(0); }}
              style={{
                color: activeNav === idx ? '#fff' : '#ffcdd2',
                fontWeight: activeNav === idx ? 700 : 500,
                fontSize: '1rem',
                cursor: 'pointer',
                borderBottom: activeNav === idx ? '2px solid #fff' : 'none',
                padding: '4px 0',
                margin: '0 8px',
                transition: 'color 0.2s, border-bottom 0.2s'
              }}
            >
              {label}
            </span>
          ))}
        </nav>
      </div>

      {/* Page Content */}
      <div
        style={{
          width: '100%',
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 24px 24px 24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Matches Section */}
        {activeNav === 0 && (
          <>
            <div
              style={{
                background: '#263238',
                color: '#fff',
                borderRadius: 12,
                padding: '10px 8px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
                flexWrap: 'nowrap',
                width: '100%',
                boxSizing: 'border-box',
              }}
              className="host-tournament-bar"
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Want to start a match?
              </span>
              <button
                style={{
                  background: '#009688',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  padding: '3px 10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #0002',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => navigate('/match/create')}
              >
                Start a Match
              </button>
            </div>
            {/* 2 Buttons: My, Played, Created */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 18,
                justifyContent: 'center',
              }}
            >
              {SECTION_BTNS.map((label, idx) => (
                <button
                  key={label}
                  onClick={() => setActiveSection(idx)}
                  style={{
                    background: activeSection === idx ? '#e0e0e0' : '#fff',
                    color: '#b71c1c',
                    border: '1px solid #b71c1c',
                    borderRadius: 14,
                    padding: '5px 18px',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Tournaments Section */}
        {activeNav === 1 && (
          <>
            <div
              style={{
                background: '#263238',
                color: '#fff',
                borderRadius: 12,
                padding: '10px 8px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
                flexWrap: 'nowrap',
                width: '100%',
                boxSizing: 'border-box',
              }}
              className="host-tournament-bar"
            >
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
                className="host-tournament-text"
              >
                Want to host a tournament?
              </span>
              <button
                style={{
                  background: '#009688',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  padding: '3px 10px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #0002',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  width: 'auto',
                }}
                className="host-tournament-btn"
                onClick={() => navigate('/tournament')}
              >
                Host Tournament
              </button>
            </div>
            {/* 3 Buttons: My, Played, Created */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 18,
                justifyContent: 'center',
              }}
            >
              {SECTION_BTNS.map((label, idx) => (
                <button
                  key={label}
                  onClick={() => setActiveSection(idx)}
                  style={{
                    background: activeSection === idx ? '#e0e0e0' : '#fff',
                    color: '#b71c1c',
                    border: '1px solid #b71c1c',
                    borderRadius: 14,
                    padding: '5px 18px',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {activeSection === 2 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 18px 0' }}>
                  <input
                    type="text"
                    placeholder="Search tournaments..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      width: 320,
                      maxWidth: '100%',
                      padding: '10px 16px',
                      borderRadius: 20,
                      border: '1px solid #b71c1c',
                      fontSize: '1rem',
                      outline: 'none',
                      background: '#fafbfc',
                      color: '#333',
                      boxShadow: '0 2px 8px #0001'
                    }}
                  />
                </div>
                {loadingTournaments ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : createdTournaments.length === 0 ? (
                  <div style={{ color: '#888', fontSize: '1.05rem', textAlign: 'center' }}>No tournaments found.</div>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                      gap: 3,
                      justifyContent: 'center',
                    }}
                  >
                    {filteredTournaments.map(t => {
                      // Check if tournament end date is past
                      let isPast = false;
                      if (t.endDate) {
                        const endDate = new Date(t.endDate);
                        const today = new Date();
                        endDate.setHours(0,0,0,0);
                        today.setHours(0,0,0,0);
                        isPast = endDate < today;
                      }

                      return (
                        <Paper
                          key={t._id}
                          elevation={4}
                          sx={{
                            borderRadius: 4,
                            position: 'relative',
                            background: '#fff',
                            boxShadow: '0 4px 16px #0001',
                            mb: 1,
                            p: 0,
                            overflow: 'hidden',
                            minWidth: 320,
                            maxWidth: 370,
                            mx: 'auto',
                            transition: 'box-shadow 0.2s',
                            '&:hover': {
                              boxShadow: '0 8px 32px #1976d233',
                            },
                          }}
                        >
                          {/* PAST Tag */}
                          {isPast && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 14,
                                right: 14,
                                background: '#263238',
                                color: '#fff',
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.5,
                                fontSize: 14,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                zIndex: 2,
                              }}
                            >
                              PAST
                            </Box>
                          )}
                          {/* Banner Image with overlays */}
                          <Box sx={{ position: 'relative', width: '100%', height: 160, background: '#e3e3e3' }}>
                            <img
                              src={`http://localhost:5000/api/tournament/${t._id}/icon`}
                              alt="Tournament Banner"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                              onError={e => {
                                e.target.onerror = null;
                                e.target.src = '/default-tournament-banner.png';
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                bottom: 0,
                                width: '100%',
                                bgcolor: 'rgba(38,50,56,0.7)',
                                color: '#fff',
                                px: 2,
                                py: 1.2,
                                fontWeight: 700,
                                fontSize: 20,
                                letterSpacing: 0.2,
                                textShadow: '0 2px 8px #0008',
                                textAlign: 'left',
                              }}
                            >
                              {t.name}
                            </Box>
                            {isPast && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 14,
                                  right: 14,
                                  background: '#263238',
                                  color: '#fff',
                                  borderRadius: 2,
                                  px: 1.5,
                                  py: 0.5,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  letterSpacing: 0.5,
                                  zIndex: 2,
                                }}
                              >
                                PAST
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ px: 2, py: 2, bgcolor: '#fafbfc' }}>
                            <Typography sx={{ fontSize: 17, color: '#666', fontWeight: 500, textAlign: 'left', display: 'block' }}>
                              {new Date(t.startDate).toLocaleDateString()} &nbsp; to &nbsp; {new Date(t.endDate).toLocaleDateString()}
                            </Typography>
                            <Typography sx={{ fontSize: 16, color: '#1976d2', mt: 0.5, textAlign: 'left', display: 'block' }}>
                              <span style={{ color: '#888', fontWeight: 500, marginRight: 6 }}>Ground:</span>
                              <span style={{ color: '#1976d2', fontWeight: 500 }}>{t.ground}</span>
                            </Typography>
                          </Box>
                          <IconButton
                            sx={{
                              position: 'absolute',
                              bottom: 10,
                              right: 10,
                              bgcolor: '#f44336',
                              color: '#fff',
                              width: 32,
                              height: 32,
                              padding: '4px',
                              fontSize: 20,
                              '&:hover': { bgcolor: '#d32f2f' },
                              zIndex: 2,
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteTournament(t._id);
                            }}
                            aria-label="delete-tournament"
                          >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
              </div>
            )}
          </>
        )}

        {/* My Matches Section */}
        {activeNav === 0 && activeSection === 0 && (
          <Box sx={{ p: { xs: 0.5, sm: 2 } }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#b71c1c', letterSpacing: 1 }}>
              My Matches
            </Typography>
            {loadingMyMatches ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : myMatches.length === 0 ? (
              <Typography color="text.secondary">No matches to display.</Typography>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {myMatches.map((match, idx) => {
                  // Check if match is past
                  let isPast = false;
                  if (match.tournamentEndDate) {
                    const endDate = new Date(match.tournamentEndDate);
                    const today = new Date();
                    endDate.setHours(0,0,0,0);
                    today.setHours(0,0,0,0);
                    isPast = endDate < today;
                  } else if (match.date) {
                    let matchDate = new Date(match.date);
                    if (isNaN(matchDate)) {
                      // Try parsing as DD/MM/YYYY
                      const [d, m, y] = match.date.split(/[-/]/);
                      matchDate = new Date(`${y}-${m}-${d}`);
                    }
                    const today = new Date();
                    matchDate.setHours(0,0,0,0);
                    today.setHours(0,0,0,0);
                    isPast = matchDate < today;
                  }

                  return (
                    <Paper
                      key={match._id}
                      elevation={2}
                      sx={{
                        borderRadius: 3,
                        p: { xs: 1, sm: 2 },
                        mb: 1,
                        background: 'linear-gradient(120deg, #fffde7 60%, #e3f2fd 100%)',
                        position: 'relative',
                        cursor: 'pointer',
                        minWidth: 0,
                        boxShadow: '0 2px 8px #ffb30033',
                        transition: 'box-shadow 0.2s, border-left 0.2s',
                        borderLeft: { xs: 'none', sm: '6px solid #ffb300' },
                        '&:hover': { boxShadow: 6, borderLeft: { sm: '6px solid #b71c1c' } },
                        width: '100%',
                        maxWidth: 500,
                        mx: { xs: 0, sm: 'auto' },
                      }}
                    >
                      {/* PAST Tag */}
                      {isPast && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            background: '#263238',
                            color: '#fff',
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            zIndex: 2,
                          }}
                        >
                          PAST
                        </Box>
                      )}
                      {/* Tournament/Match Name */}
                      <Typography sx={{ fontStyle: 'italic', color: '#1976d2', fontWeight: 700, fontSize: 16, mb: 0.5 }}>
                        {match.tournamentName || 'Friendly Match'}
                      </Typography>
                      {/* Ground and Date */}
                      <Typography sx={{ color: '#757575', fontSize: 13, mb: 0.5, textAlign: 'center' }}>
                        {match.ground} &nbsp;|&nbsp; {match.date} &nbsp;|&nbsp; {match.overs} Ov.
                      </Typography>
                      {/* Divider */}
                      <Divider sx={{ mb: 1 }} />
                      {/* Teams, names, and scores in one line */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0,
                          width: '100%',
                          flexWrap: 'nowrap',
                        }}
                      >
                        {/* Team A Avatar + Name in one line */}
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 3 }}>
                          <Avatar
                            src={match.teamAIcon}
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 700,
                              fontSize: 22,
                              border: '2px solid #fff',
                              boxShadow: '0 2px 8px #1976d233',
                              mr: 1,
                              flexShrink: 0,
                            }}
                          >
                            {match.teamA?.[0] || 'A'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: '#43a047',
                                fontSize: 17,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                                textAlign: 'left',
                              }}
                            >
                              {match.teamA}
                            </Typography>
                            <Typography sx={{ fontWeight: 700, color: '#263238', fontSize: 14, textAlign: 'left' }}>
                              {match.teamAScore || '--'}
                              {match.teamAOvers ? ` (${match.teamAOvers} Ov.)` : ''}
                            </Typography>
                          </Box>
                        </Box>
                        {/* VS */}
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: '#b71c1c',
                            fontSize: 18,
                            mx: 0,
                            flexShrink: 0,
                            minWidth: 32,
                            textAlign: 'center',
                          }}
                        >
                          VS
                        </Typography>
                        {/* Team B Avatar + Name in one line */}
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 3, justifyContent: 'flex-end' }}>
                          <Box sx={{ minWidth: 0, textAlign: 'right', mr: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: '#1565c0',
                                fontSize: 17,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                                textAlign: 'right',
                              }}
                            >
                              {match.teamB}
                            </Typography>
                            <Typography sx={{ fontWeight: 700, color: '#263238', fontSize: 14, textAlign: 'right' }}>
                              {match.teamBScore || '--'}
                              {match.teamBOvers ? ` (${match.teamBOvers} Ov.)` : ''}
                            </Typography>
                          </Box>
                          <Avatar
                            src={match.teamBIcon}
                            sx={{
                              bgcolor: '#1565c0',
                              width: 40,
                              height: 40,
                              fontWeight: 700,
                              fontSize: 22,
                              border: '2px solid #fff',
                              boxShadow: '0 2px 8px #1565c033',
                              ml: 0,
                              flexShrink: 0,
                            }}
                          >
                            {match.teamB?.[0] || 'B'}
                          </Avatar>
                        </Box>
                      </Box>
                      {/* Centered Result */}
                      <Box sx={{ mt: 1 }}>
                        <Typography sx={{
                          color: match.result ? '#43a047' : '#263238',
                          fontSize: { xs: 13, sm: 14 },
                          fontWeight: 600,
                          textAlign: 'center',
                          letterSpacing: 0.5
                        }}>
                          {match.result || 'Result will be shown here.'}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* Created Matches Section */}
        {activeNav === 0 && activeSection === 2 && (
          <Box sx={{ p: { xs: 1, sm: 3 } }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 900, color: '#b71c1c', letterSpacing: 1 }}>
              Created Matches
            </Typography>
            {loadingCreatedMatches ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : createdMatches.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No matches created yet.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {createdMatches.map((match, idx) => {
                  // --- PAST LOGIC: show PAST if tournamentEndDate or match.date is before today ---
                  let isPast = false;
                  if (match.tournamentEndDate) {
                    const endDate = new Date(match.tournamentEndDate);
                    const today = new Date();
                    endDate.setHours(0,0,0,0);
                    today.setHours(0,0,0,0);
                    isPast = endDate < today;
                  } else if (match.date) {
                    let matchDate;
                    // Try ISO first
                    if (/^\d{4}-\d{2}-\d{2}$/.test(match.date)) {
                      matchDate = new Date(match.date);
                    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(match.date)) {
                      // DD/MM/YYYY
                      const [d, m, y] = match.date.split(/[-/]/);
                      matchDate = new Date(`${y}-${m}-${d}`);
                    } else {
                      // fallback
                      matchDate = new Date(match.date);
                    }
                    const today = new Date();
                    matchDate.setHours(0,0,0,0);
                    today.setHours(0,0,0,0);
                    isPast = matchDate < today;
                  }
                  // ------------------------------------------------------

                  return (
                    <Paper
                      key={match._id}
                      elevation={2}
                      sx={{
                        borderRadius: 3,
                        p: { xs: 1, sm: 2 },
                        mb: 1,
                        background: 'linear-gradient(120deg, #fffde7 60%, #e3f2fd 100%)',
                        position: 'relative',
                        cursor: 'pointer',
                        minWidth: 0,
                        boxShadow: '0 2px 8px #ffb30033',
                        transition: 'box-shadow 0.2s, border-left 0.2s',
                        borderLeft: { xs: 'none', sm: '6px solid #ffb300' },
                        '&:hover': { boxShadow: 6, borderLeft: { sm: '6px solid #b71c1c' } },
                        width: '100%',
                        maxWidth: 500,
                        mx: { xs: 0, sm: 'auto' },
                      }}
                      onClick={() => navigate(`/match/${match._id}`)}
                    >
                      {/* PAST Tag */}
                      {isPast && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            background: '#263238',
                            color: '#fff',
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            zIndex: 2,
                          }}
                        >
                          PAST
                        </Box>
                      )}
                      {/* Tournament/Match Name */}
                      <Typography sx={{ fontStyle: 'italic', color: '#1976d2', fontWeight: 700, fontSize: 16, mb: 0.5 }}>
                        {match.tournamentName || 'Friendly Match'}
                      </Typography>
                      {/* Ground and Date */}
                      <Typography sx={{ color: '#757575', fontSize: 13, mb: 0.5, textAlign: 'center' }}>
                        {match.ground} &nbsp;|&nbsp; {match.date} &nbsp;|&nbsp; {match.overs} Ov.
                      </Typography>
                      {/* Divider */}
                      <Divider sx={{ mb: 1 }} />
                      {/* Teams, names, and scores in one line */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0,
                          width: '100%',
                          flexWrap: 'nowrap',
                        }}
                      >
                        {/* Team A Avatar + Name in one line */}
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 3 }}>
                          <Avatar
                            src={match.teamAIcon}
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 700,
                              fontSize: 22,
                              border: '2px solid #fff',
                              boxShadow: '0 2px 8px #1976d233',
                              mr: 1,
                              flexShrink: 0,
                            }}
                          >
                            {match.teamA?.[0] || 'A'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: '#43a047',
                                fontSize: 17,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                                textAlign: 'left',
                              }}
                            >
                              {match.teamA}
                            </Typography>
                            <Typography sx={{ fontWeight: 700, color: '#263238', fontSize: 14, textAlign: 'left' }}>
                              {match.teamAScore || '--'}
                              {match.teamAOvers ? ` (${match.teamAOvers} Ov.)` : ''}
                            </Typography>
                          </Box>
                        </Box>
                        {/* VS */}
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: '#b71c1c',
                            fontSize: 18,
                            mx: 0,
                            flexShrink: 0,
                            minWidth: 32,
                            textAlign: 'center',
                          }}
                        >
                          VS
                        </Typography>
                        {/* Team B Avatar + Name in one line */}
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 3, justifyContent: 'flex-end' }}>
                          <Box sx={{ minWidth: 0, textAlign: 'right', mr: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: '#1565c0',
                                fontSize: 17,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                                textAlign: 'right',
                              }}
                            >
                              {match.teamB}
                            </Typography>
                            <Typography sx={{ fontWeight: 700, color: '#263238', fontSize: 14, textAlign: 'right' }}>
                              {match.teamBScore || '--'}
                              {match.teamBOvers ? ` (${match.teamBOvers} Ov.)` : ''}
                            </Typography>
                          </Box>
                          <Avatar
                            src={match.teamBIcon}
                            sx={{
                              bgcolor: '#1565c0',
                              width: 40,
                              height: 40,
                              fontWeight: 700,
                              fontSize: 22,
                              border: '2px solid #fff',
                              boxShadow: '0 2px 8px #1565c033',
                              ml: 0,
                              flexShrink: 0,
                            }}
                          >
                            {match.teamB?.[0] || 'B'}
                          </Avatar>
                        </Box>
                      </Box>
                      {/* Centered Result */}
                      <Box sx={{ mt: 1 }}>
                        <Typography sx={{
                          color: match.result ? '#43a047' : '#263238',
                          fontSize: { xs: 13, sm: 14 },
                          fontWeight: 600,
                          textAlign: 'center',
                          letterSpacing: 0.5
                        }}>
                          {match.result || 'Result will be shown here.'}
                        </Typography>
                      </Box>
                      {/* Delete Button at bottom right */}
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          right: 10,
                          bgcolor: '#f44336',
                          color: '#fff',
                          width: 20,
                          height: 20,
                          padding: '4px',
                          fontSize: 18,
                          '&:hover': { bgcolor: '#d32f2f' },
                          zIndex: 2,
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this match?')) {
                            fetch(`http://localhost:5000/api/matches/${match._id}`, {
                              method: 'DELETE',
                            })
                              .then(res => res.json())
                              .then(data => {
                                setCreatedMatches(prev => prev.filter(m => m._id !== match._id));
                              });
                          }
                        }}
                        aria-label="delete"
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

      </div>
    </div>
  );
};

export default MyCricketPage;