import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Avatar, IconButton, Tooltip, List, ListItem } from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const TeamCard = ({ teamName, joinCode, joinLink, players }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Card sx={{ minWidth: 250, m: 2, boxShadow: 4, borderRadius: 4, textAlign: 'center' }}>
      <CardContent>
        <Avatar sx={{ bgcolor: '#1976d2', mx: 'auto', mb: 1, width: 56, height: 56 }}>
          <SportsCricketIcon fontSize="large" />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
          {teamName}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          <strong>Join Code:</strong> {joinCode}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2">
            <strong>Link:</strong> <a href={joinLink}>{joinLink}</a>
          </Typography>
          <Tooltip title={copied ? "Copied!" : "Copy link"}>
            <IconButton size="small" onClick={handleCopy} sx={{ ml: 1 }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Players:</Typography>
          <List dense>
            {players && players.length > 0 ? (
              players.map((player, idx) => (
                <ListItem key={idx} sx={{ justifyContent: 'center', py: 0.2 }}>
                  <Typography variant="body2">{player}</Typography>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No players yet</Typography>
            )}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

const LiveMatchPage = () => {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/matches/latest')
      .then(res => res.json())
      .then(data => setMatch(data.match))
      .catch(() => setMatch(null));
  }, []);

  if (!match) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <h2>Live Match Page</h2>
        <p>Loading match details...</p>
      </Box>
    );
  }

  const joinCodeA = `A_${match._id.toString().slice(-4)}`;
  const joinCodeB = `B_${match._id.toString().slice(-4)}`;
  const joinLinkA = `${window.location.origin}/join/${joinCodeA}`;
  const joinLinkB = `${window.location.origin}/join/${joinCodeB}`;

  return (
    <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 900, color: '#1976d2' }}>
        {match.teamA} vs {match.teamB}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
        <TeamCard
          teamName={match.teamA}
          joinCode={joinCodeA}
          joinLink={joinLinkA}
          players={match.teamAPlayers}
        />
        <TeamCard
          teamName={match.teamB}
          joinCode={joinCodeB}
          joinLink={joinLinkB}
          players={match.teamBPlayers}
        />
      </Box>
    </Box>
  );
};

export default LiveMatchPage;