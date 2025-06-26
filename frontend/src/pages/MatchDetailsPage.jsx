import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import { Divider as MuiDivider } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MatchDetailsPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add player profiles loading state
  const [profilesLoading, setProfilesLoading] = useState(true);

  const [teamAProfiles, setTeamAProfiles] = useState([]);
  const [teamBProfiles, setTeamBProfiles] = useState([]);
  const [removalMode, setRemovalMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [selectSquadMode, setSelectSquadMode] = useState(false);
  const [selectedSquadA, setSelectedSquadA] = useState([]);
  const [selectedSquadB, setSelectedSquadB] = useState([]);
  const [squadConfirmed, setSquadConfirmed] = useState(false);
  const [lastConfirmedSquadA, setLastConfirmedSquadA] = useState([]);
  const [lastConfirmedSquadB, setLastConfirmedSquadB] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/matches/${matchId}`)
      .then(res => res.json())
      .then(data => setMatch(data))
      .catch(() => setMatch(null))
      .finally(() => setLoading(false));
  }, [matchId]);

  useEffect(() => {
    if (!match) return;
    setProfilesLoading(true);
    const fetchProfiles = async (players) => {
      return Promise.all(players.map(async (p) => {
        const res = await fetch(`http://localhost:5000/user/${p.email}`);
        return res.ok
          ? await res.json()
          : { email: p.email, name: p.name || p.email, profilePic: '', playingRole: '' };
      }));
    };
    Promise.all([
      fetchProfiles(match.teamAPlayers).then(setTeamAProfiles),
      fetchProfiles(match.teamBPlayers).then(setTeamBProfiles),
    ]).finally(() => setProfilesLoading(false));
  }, [match]);

  const handleToggleRemovalMode = () => {
    setRemovalMode(!removalMode);
    setSelectedPlayers([]);
  };

  const handleRemoveSelectedPlayers = async () => {
    for (const { team, email } of selectedPlayers) {
      await fetch(`http://localhost:5000/api/matches/${matchId}/remove-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team: team === 'A' ? 'teamA' : 'teamB', email }),
      });
    }
    const updatedMatch = await fetch(`http://localhost:5000/api/matches/${matchId}`).then(r => r.json());
    setMatch(updatedMatch);
    setRemovalMode(false);
    setSelectedPlayers([]);
  };

  const handleStartMatch = () => {
    setSelectSquadMode(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!match) {
    return <Typography sx={{ mt: 4, textAlign: 'center' }}>Match not found.</Typography>;
  }

  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: 'auto',
        mt: 4,
        p: { xs: 1, sm: 2 },
        background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
        minHeight: '100vh',
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
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, mb: 3, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: 'center', color: '#1976d2' }}>
          {match.tournamentName || 'Friendly Match'}
        </Typography>
        <Typography sx={{ color: '#757575', mb: 2, textAlign: 'center', fontSize: 18 }}>
          <SportsCricketIcon sx={{ mr: 1, color: '#43a047', verticalAlign: 'middle' }} />
          {match.ground} &nbsp;|&nbsp; {match.date} &nbsp;|&nbsp; {match.overs} Ov.
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, color: '#1976d2', letterSpacing: 2 }}>
           SQUAD
        </Typography>
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            mb: 1,
            px: 1,
            py: 1,
            fontWeight: 700,
            fontSize: 16,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          {/* Team A: Avatar and Name in one line, centered */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
            <Avatar
              src={match.teamAIcon}
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#e3f2fd',
                color: '#1976d2',
                fontWeight: 700,
                mr: 1,
              }}
            >
              {match.teamA?.[0] || 'A'}
            </Avatar>
            <Box sx={{ color: '#388e3c', fontWeight: 700, fontSize: 18 }}>
              {match.teamA}
            </Box>
          </Box>
          {/* Vertical Divider between teams */}
          <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: '#bdbdbd' }} />
          {/* Team B: Avatar and Name in one line, centered */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
            <Avatar
              src={match.teamBIcon}
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#e3f2fd',
                color: '#1565c0',
                fontWeight: 700,
                mr: 1,
              }}
            >
              {match.teamB?.[0] || 'B'}
            </Avatar>
            <Box sx={{ color: '#1565c0', fontWeight: 700, fontSize: 18 }}>
              {match.teamB}
            </Box>
          </Box>
        </Box>
        {/* Player List Loading Spinner */}
        {profilesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            {/* --- Your full player list rendering block goes here, unchanged --- */}
            {selectSquadMode ? (
              <Box>
                {Array.from({ length: Math.max(
                  (selectedSquadA.length > 0 && !selectSquadMode ? selectedSquadA.length : teamAProfiles.length),
                  (selectedSquadB.length > 0 && !selectSquadMode ? selectedSquadB.length : teamBProfiles.length)
                ) }).map((_, idx) => {
                  const playerA = (!selectSquadMode && selectedSquadA.length > 0)
                    ? teamAProfiles.filter((p) => selectedSquadA.includes(p.email))[idx]
                    : teamAProfiles[idx];
                  const playerB = (!selectSquadMode && selectedSquadB.length > 0)
                    ? teamBProfiles.filter((p) => selectedSquadB.includes(p.email))[idx]
                    : teamBProfiles[idx];

                  const isSelectedA =
                    (selectSquadMode && playerA && selectedSquadA.includes(playerA.email)) ||
                    (removalMode && playerA && selectedPlayers.some((p) => p.team === 'A' && p.email === playerA.email));
                  const isSelectedB =
                    (selectSquadMode && playerB && selectedSquadB.includes(playerB.email)) ||
                    (removalMode && playerB && selectedPlayers.some((p) => p.team === 'B' && p.email === playerB.email));

                  return (
                    <React.Fragment key={idx}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'stretch',
                          bgcolor: 'transparent',
                          borderRadius: 0,
                          px: { xs: 0, sm: 0 },
                          py: { xs: 0, sm: 0 },
                          mb: 0,
                        }}
                      >
                        {/* Team A Player Card */}
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: 0,
                            bgcolor: isSelectedA
                              ? (removalMode ? '#ffebee' : '#e3f2fd')
                              : '#fff',
                            borderRadius: 2,
                            px: { xs: 1, sm: 1.5 },
                            py: { xs: 1, sm: 1.2 },
                            mr: { xs: 0.5, sm: 1 },
                            border: removalMode && isSelectedA ? '2px solid #d32f2f' : '2px solid transparent',
                            cursor: (selectSquadMode || removalMode) && playerA ? 'pointer' : 'default',
                            transition: 'background 0.2s, border 0.2s',
                            boxShadow: 0,
                            position: 'relative',
                            minHeight: 56,
                          }}
                          onClick={() => {
                            if (selectSquadMode && playerA) {
                              setSelectedSquadA((prev) =>
                                prev.includes(playerA.email)
                                  ? prev.filter((e) => e !== playerA.email)
                                  : [...prev, playerA.email]
                              );
                            } else if (removalMode && playerA) {
                              setSelectedPlayers((prev) =>
                                prev.some((p) => p.team === 'A' && p.email === playerA.email)
                                  ? prev.filter((p) => !(p.team === 'A' && p.email === playerA.email))
                                  : [...prev, { team: 'A', email: playerA.email }]
                              );
                            }
                          }}
                        >
                          {playerA ? (
                            <>
                              <Avatar
                                src={playerA.profilePic}
                                sx={{
                                  width: { xs: 38, sm: 40 },
                                  height: { xs: 38, sm: 40 },
                                  mr: 1.2,
                                  bgcolor: '#e0e0e0',
                                  fontWeight: 700,
                                }}
                              >
                                {(!playerA.profilePic && playerA.name) ? playerA.name[0] : ''}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: { xs: 16, sm: 17 }, textAlign: 'left' }}>
                                  {playerA.name || playerA.email}
                                </Typography>
                                <Typography sx={{ fontSize: { xs: 13, sm: 14 }, color: '#888', textAlign: 'left' }}>
                                  {playerA.playingRole || 'Player'}
                                </Typography>
                              </Box>
                              {/* Bottom blue line */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: 12,
                                  right: 12,
                                  bottom: 6,
                                  height: 3,
                                  bgcolor: '#90caf9',
                                  borderRadius: 2,
                                  opacity: 0.5,
                                }}
                              />
                            </>
                          ) : null}
                        </Box>
                        {/* Vertical Divider */}
                        <MuiDivider orientation="vertical" flexItem sx={{ mx: { xs: 0.5, sm: 1 }, borderColor: '#e0e0e0' }} />
                        {/* Team B Player Card */}
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: 0,
                            bgcolor: isSelectedB
                              ? (removalMode ? '#ffebee' : '#e3f2fd')
                              : '#fff',
                            borderRadius: 2,
                            px: { xs: 1, sm: 1.5 },
                            py: { xs: 1, sm: 1.2 },
                            ml: { xs: 0.5, sm: 1 },
                            border: removalMode && isSelectedB ? '2px solid #d32f2f' : '2px solid transparent',
                            cursor: (selectSquadMode || removalMode) && playerB ? 'pointer' : 'default',
                            transition: 'background 0.2s, border 0.2s',
                            boxShadow: 0,
                            position: 'relative',
                            minHeight: 56,
                          }}
                          onClick={() => {
                            if (selectSquadMode && playerB) {
                              setSelectedSquadB((prev) =>
                                prev.includes(playerB.email)
                                  ? prev.filter((e) => e !== playerB.email)
                                  : [...prev, playerB.email]
                              );
                            } else if (removalMode && playerB) {
                              setSelectedPlayers((prev) =>
                                prev.some((p) => p.team === 'B' && p.email === playerB.email)
                                  ? prev.filter((p) => !(p.team === 'B' && p.email === playerB.email))
                                  : [...prev, { team: 'B', email: playerB.email }]
                              );
                            }
                          }}
                        >
                          {playerB ? (
                            <>
                              <Avatar
                                src={playerB.profilePic}
                                sx={{
                                  width: { xs: 38, sm: 40 },
                                  height: { xs: 38, sm: 40 },
                                  mr: 1.2,
                                  bgcolor: '#e0e0e0',
                                  fontWeight: 700,
                                }}
                              >
                                {(!playerB.profilePic && playerB.name) ? playerB.name[0] : ''}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: { xs: 16, sm: 17 }, textAlign: 'left' }}>
                                  {playerB.name || playerB.email}
                                </Typography>
                                <Typography sx={{ fontSize: { xs: 13, sm: 14 }, color: '#888', textAlign: 'left' }}>
                                  {playerB.playingRole || 'Player'}
                                </Typography>
                              </Box>
                              {/* Bottom blue line */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: 12,
                                  right: 12,
                                  bottom: 6,
                                  height: 3,
                                  bgcolor: '#90caf9',
                                  borderRadius: 2,
                                  opacity: 0.5,
                                }}
                              />
                            </>
                          ) : null}
                        </Box>
                      </Box>
                    </React.Fragment>
                  );
                })}
              </Box>
            ) : !selectSquadMode ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row', // Always row, even on mobile
                  gap: { xs: 2, sm: 3 },
                  mt: 2,
                  flexWrap: 'wrap',
                  position: 'relative',
                }}
              >
                {/* Team A Column */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    flexBasis: 0,
                    pr: 2,
                    pb: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                  }}
                >
                  {/* Only show "Playing Squad" and "Bench" when NOT in selectSquadMode and a squad is selected */}
                  {(!selectSquadMode && selectedSquadA.length > 0) && (
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: '#388e3c',
                        mb: 1,
                        fontSize: 16,
                        textAlign: 'center',
                        letterSpacing: 1,
                      }}
                    >
                      Playing Squad
                    </Typography>
                  )}

                  {/* Player List: Always show full list in selectSquadMode, or split when not in selectSquadMode and squad is selected */}
                  {(selectSquadMode || selectedSquadA.length === 0
                    ? teamAProfiles
                    : teamAProfiles.filter((p) => selectedSquadA.includes(p.email))
                  ).map((playerA, idx, arr) => {
                    const isSelected =
                      removalMode &&
                      selectedPlayers.some((p) => p.team === 'A' && p.email === playerA.email);
                    return (
                      <React.Fragment key={playerA.email}>
                        <Box
                          onClick={() => {
                            if (!removalMode) return;
                            setSelectedPlayers((prev) =>
                              prev.some((p) => p.team === 'A' && p.email === playerA.email)
                                ? prev.filter((p) => !(p.team === 'A' && p.email === playerA.email))
                                : [...prev, { team: 'A', email: playerA.email }]
                            );
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: isSelected ? '#ffebee' : idx % 2 === 0 ? '#fff' : '#f9f9f9',
                            borderRadius: 2,
                            px: 1,
                            py: 0.7,
                            mb: 0,
                            cursor: removalMode ? 'pointer' : 'default',
                            border: isSelected ? '2px solid #d32f2f' : '2px solid transparent',
                            transition: 'background 0.2s, border 0.2s',
                          }}
                        >
                          <Avatar src={playerA.profilePic} sx={{ width: 32, height: 32, mr: 1 }}>
                            {(!playerA.profilePic && playerA.name) ? playerA.name[0] : ''}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 15, textAlign: 'left' }}>
                              {playerA.name || playerA.email}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#888', textAlign: 'left' }}>
                              {playerA.playingRole || 'Player'}
                            </Typography>
                          </Box>
                        </Box>
                        {idx < arr.length - 1 && (
                          <Divider
                            sx={{
                              my: 1,
                              borderColor: '#90caf9',
                              borderBottomWidth: 2,
                              borderBottomStyle: 'solid',
                              opacity: 0.7,
                              width: '90%',
                              mx: 'auto',
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Bench: Only show when NOT in selectSquadMode and a squad is selected */}
                  {(!selectSquadMode && selectedSquadA.length > 0) && (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#888',
                          mt: 2,
                          mb: 1,
                          fontSize: 16,
                          textAlign: 'center',
                          letterSpacing: 1,
                        }}
                      >
                        Bench
                      </Typography>
                      {teamAProfiles
                        .filter((p) => !selectedSquadA.includes(p.email))
                        .map((playerA, idx, arr) => {
                          const isSelected =
                            removalMode &&
                            selectedPlayers.some((p) => p.team === 'A' && p.email === playerA.email);
                          return (
                            <React.Fragment key={playerA.email}>
                              <Box
                                onClick={() => {
                                  if (!removalMode) return;
                                  setSelectedPlayers((prev) =>
                                    prev.some((p) => p.team === 'A' && p.email === playerA.email)
                                      ? prev.filter((p) => !(p.team === 'A' && p.email === playerA.email))
                                      : [...prev, { team: 'A', email: playerA.email }]
                                  );
                                }}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  bgcolor: isSelected ? '#ffebee' : idx % 2 === 0 ? '#fff' : '#f9f9f9',
                                  borderRadius: 2,
                                  px: 1,
                                  py: 0.7,
                                  mb: 0,
                                  cursor: removalMode ? 'pointer' : 'default',
                                  border: isSelected ? '2px solid #d32f2f' : '2px solid transparent',
                                  transition: 'background 0.2s, border 0.2s',
                                }}
                              >
                                <Avatar src={playerA.profilePic} sx={{ width: 28, height: 28, mr: 1 }}>
                                  {(!playerA.profilePic && playerA.name) ? playerA.name[0] : ''}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography sx={{ fontWeight: 500, fontSize: 14, color: '#888', textAlign: 'left' }}>
                                    {playerA.name || playerA.email}
                                  </Typography>
                                  <Typography sx={{ fontSize: 12, color: '#bbb', textAlign: 'left' }}>
                                    {playerA.playingRole || 'Player'}
                                  </Typography>
                                </Box>
                              </Box>
                              {idx < arr.length - 1 && (
                                <Divider
                                  sx={{
                                    my: 1,
                                    borderColor: '#90caf9',
                                    borderBottomWidth: 2,
                                    borderBottomStyle: 'solid',
                                    opacity: 0.7,
                                    width: '90%',
                                    mx: 'auto',
                                  }}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                    </>
                  )}
                </Box>

                {/* Vertical Divider at center for all screens */}
                <Box
                  sx={{
                    display: 'block',
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: '0px',
                    height: '100%',
                    zIndex: 1,
                  }}
                >
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      height: '100%',
                      borderRight: '3px solid #bdbdbd',
                      borderRadius: 2,
                      opacity: 0.5,
                      mx: 0,
                    }}
                  />
                </Box>

                {/* Team B Column */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    flexBasis: 0,
                    pl: 2,
                    pt: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                  }}
                >
                  {/* Show "Playing Squad" title only when NOT in selectSquadMode and a squad is selected */}
                  
{/* Only show "Playing Squad" and "Bench" when NOT in selectSquadMode and a squad is selected */}
{(!selectSquadMode && selectedSquadB.length > 0) && (
  <Typography
    sx={{
      fontWeight: 700,
      color: '#388e3c',
      mb: 1,
      fontSize: 16,
      textAlign: 'center',
      letterSpacing: 1,
    }}
  >
    Playing Squad
  </Typography>
)}

{/* Player List: Always show full list in selectSquadMode, or split when not in selectSquadMode and squad is selected */}
{(selectSquadMode || selectedSquadB.length === 0
  ? teamBProfiles
  : teamBProfiles.filter((p) => selectedSquadB.includes(p.email))
).map((playerB, idx, arr) => {
  const isSelected =
    removalMode &&
    selectedPlayers.some((p) => p.team === 'B' && p.email === playerB.email);
  return (
    <React.Fragment key={playerB.email}>
      <Box
        onClick={() => {
          if (!removalMode) return;
          setSelectedPlayers((prev) =>
            prev.some((p) => p.team === 'B' && p.email === playerB.email)
              ? prev.filter((p) => !(p.team === 'B' && p.email === playerB.email))
              : [...prev, { team: 'B', email: playerB.email }]
          );
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: isSelected ? '#ffebee' : idx % 2 === 0 ? '#fff' : '#f9f9f9',
          borderRadius: 2,
          px: 1,
          py: 0.7,
          mb: 0,
          cursor: removalMode ? 'pointer' : 'default',
          border: isSelected ? '2px solid #d32f2f' : '2px solid transparent',
          transition: 'background 0.2s, border 0.2s',
        }}
      >
        <Avatar src={playerB.profilePic} sx={{ width: 32, height: 32, mr: 1 }}>
          {(!playerB.profilePic && playerB.name) ? playerB.name[0] : ''}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 15, textAlign: 'left' }}>
            {playerB.name || playerB.email}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#888', textAlign: 'left' }}>
            {playerB.playingRole || 'Player'}
          </Typography>
        </Box>
      </Box>
      {idx < arr.length - 1 && (
        <Divider
          sx={{
            my: 1,
            borderColor: '#90caf9',
            borderBottomWidth: 2,
            borderBottomStyle: 'solid',
            opacity: 0.7,
            width: '90%',
            mx: 'auto',
          }}
        />
      )}
    </React.Fragment>
  );
})}

{/* Bench: Only show when NOT in selectSquadMode and a squad is selected */}
{(!selectSquadMode && selectedSquadB.length > 0) && (
  <>
    <Typography
      sx={{
        fontWeight: 700,
        color: '#888',
        mt: 2,
        mb: 1,
        fontSize: 16,
        textAlign: 'center',
        letterSpacing: 1,
      }}
    >
      Bench
    </Typography>
    {teamBProfiles
      .filter((p) => !selectedSquadB.includes(p.email))
      .map((playerB, idx, arr) => {
        const isSelected =
          removalMode &&
          selectedPlayers.some((p) => p.team === 'B' && p.email === playerB.email);
        return (
          <React.Fragment key={playerB.email}>
            <Box
              onClick={() => {
                if (!removalMode) return;
                setSelectedPlayers((prev) =>
                  prev.some((p) => p.team === 'B' && p.email === playerB.email)
                    ? prev.filter((p) => !(p.team === 'B' && p.email === playerB.email))
                    : [...prev, { team: 'B', email: playerB.email }]
                );
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: isSelected ? '#ffebee' : idx % 2 === 0 ? '#fff' : '#f9f9f9',
                borderRadius: 2,
                px: 1,
                py: 0.7,
                mb: 0,
                cursor: removalMode ? 'pointer' : 'default',
                border: isSelected ? '2px solid #d32f2f' : '2px solid transparent',
                transition: 'background 0.2s, border 0.2s',
              }}
            >
              <Avatar src={playerB.profilePic} sx={{ width: 28, height: 28, mr: 1 }}>
                {(!playerB.profilePic && playerB.name) ? playerB.name[0] : ''}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 500, fontSize: 14, color: '#888', textAlign: 'left' }}>
                  {playerB.name || playerB.email}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#bbb', textAlign: 'left' }}>
                  {playerB.playingRole || 'Player'}
                </Typography>
              </Box>
            </Box>
            {idx < arr.length - 1 && (
              <Divider
                sx={{
                  my: 1,
                  borderColor: '#90caf9',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  opacity: 0.7,
                  width: '90%',
                  mx: 'auto',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
  </>
)}
                </Box>
              </Box>
            ) : null}
          </>
        )}

        {/* Start/Confirm Squad Button */}
        {!selectSquadMode && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt:4 , textAlign: 'center' }}>
            {(selectedSquadA.length === 0 && selectedSquadB.length === 0) ? (
              <Button
                variant="contained"
                size="small"
                startIcon={<SportsCricketIcon />}
                onClick={handleStartMatch}
                sx={{
                  minWidth: 120,
                  fontWeight: 700,
                  fontSize: 15,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  background: '#bdbdbd',
                  color: '#263238',
                  boxShadow: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    background: '#9e9e9e',
                    color: '#fff',
                    boxShadow: 'none',
                  },
                }}
              >
                Select Squad
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  setSelectSquadMode(true);
                  setSquadConfirmed(false);
                }}
                sx={{
                  fontWeight: 700,
                  fontSize: 14,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    background: '#e3f2fd',
                  },
                }}
              >
                Edit Squad
              </Button>
            )}
          </Box>
        )}

        {selectSquadMode && !squadConfirmed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<SportsCricketIcon />}
              onClick={async () => {
                await fetch(`http://localhost:5000/api/matches/${matchId}/set-squad`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    teamA: selectedSquadA,
                    teamB: selectedSquadB,
                  }),
                });
                setLastConfirmedSquadA(selectedSquadA);
                setLastConfirmedSquadB(selectedSquadB);
                setSquadConfirmed(true);
                setSelectSquadMode(false);
              }}
              sx={{
                minWidth: 120,
                fontWeight: 700,
                fontSize: 15,
                textTransform: 'uppercase',
                letterSpacing: 1,
                background: '#bdbdbd',
                color: '#263238',
                boxShadow: 'none',
                borderRadius: 2,
                '&:hover': {
                  background: '#9e9e9e',
                  color: '#fff',
                  boxShadow: 'none',
                },
              }}
            >
              Confirm Squad
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                setSelectedSquadA(lastConfirmedSquadA);
                setSelectedSquadB(lastConfirmedSquadB);
                setSelectSquadMode(false);
                setSquadConfirmed(true);
              }}
              sx={{
                minWidth: 80,
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: 1,
                borderColor: '#d32f2f',
                color: '#d32f2f',
                '&:hover': {
                  borderColor: '#b71c1c',
                  background: '#ffebee',
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        )}

        {/* Remove Button Area */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
          {!removalMode ? (
            <Button
              variant="contained"
              color="error"
              onClick={handleToggleRemovalMode}
              size="small"
              sx={{ minWidth: 140, alignSelf: 'center' }}
            >
              Remove Players
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="error"
                disabled={selectedPlayers.length === 0}
                onClick={handleRemoveSelectedPlayers}
                size="small"
                sx={{ minWidth: 140, alignSelf: 'center' }}
              >
                Remove Selected ({selectedPlayers.length})
              </Button>
              <Button
                variant="outlined"
                onClick={handleToggleRemovalMode}
                size="small"
                sx={{ minWidth: 100, alignSelf: 'center' }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Typography sx={{ fontWeight: 700, color: '#1976d2', mr: 1 }}>
            Join Code:
          </Typography>
          <Typography sx={{ fontWeight: 700, color: '#263238', letterSpacing: 1, mr: 1 }}>
            {match.joinCode}
          </Typography>
          <Tooltip title="Copy Join Code">
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
                // Try Clipboard API first
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
                  input.setSelectionRange(0, 99999); // For mobile
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
      </Paper>
    </Box>
  );
};

export default MatchDetailsPage;