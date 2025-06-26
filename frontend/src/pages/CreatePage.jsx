import React from 'react';
import { Box, Button, Typography } from '@mui/material'; // <-- Add Typography here
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Fade } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';

const cardStyles = gradient => ({
  width: { xs: '90vw', sm: 300, md: 340 },
  minWidth: { xs: 0, sm: 260 },
  maxWidth: { xs: '100%', sm: 340 },
  py: { xs: 3, sm: 5 },
  px: { xs: 2, sm: 3 },
  borderRadius: { xs: '32px', sm: '50px 12px 50px 12px' },
  boxShadow: '0 8px 32px 0 #1976d233',
  textAlign: 'center',
  background: gradient,
  position: 'relative',
  overflow: 'visible',
  transition: 'transform 0.25s, box-shadow 0.25s',
  border: '3px solid #fff',
  mx: { xs: 'auto', sm: 0 },
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 12px 28px 0 #1976d244',
    border: '3px solid #1976d2',
    zIndex: 2,
  },
});

const iconCircle = (color, bg) => ({
  fontSize: { xs: 44, sm: 64 },
  mb: { xs: 1, sm: 2 },
  color,
  background: bg,
  borderRadius: '50%',
  p: { xs: 1, sm: 1.5 },
  boxShadow: `0 4px 24px 0 ${color}33, 0 0 0 8px ${bg}99`,
  border: `3px solid ${color}`,
  transition: 'box-shadow 0.2s, border 0.2s',
  display: 'inline-block',
});

const CreateOptionsPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Create New Heading */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', sm: 'center' },
          mt: { xs: 2, sm: 6 },
          mb: { xs: 3, sm: 5 },
          px: { xs: 1, sm: 0 },
          width: '100%',
          gap: 2,
        }}
      >
        <Button
          onClick={() => navigate(-1)}
          sx={{
            minWidth: 0,
            p: 1,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 8px #1976d233',
            color: '#1976d2',
            mr: { xs: 2, sm: 3 },
            '&:hover': {
              background: '#e3f2fd',
            },
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            textAlign: { xs: 'left', sm: 'center' },
            color: '#2196f3',
            letterSpacing: 2,
            textShadow: '0 4px 16px #1976d244, 0 2px 8px #1976d233',
            fontSize: { xs: '2rem', sm: '2.8rem', md: '3rem' },
            lineHeight: 1.1,
            flex: 1,
          }}
        >
          Create Something New
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 3, sm: 8 },
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          pt: { xs: 0, sm: 0 },
          pb: { xs: 3, sm: 6 },
        }}
      >
        {/* New Tournament Card */}
        <Fade in timeout={900}>
          <Card sx={cardStyles('linear-gradient(135deg, #fffde7 0%, #bbdefb 100%)')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 1, sm: 2 } }}>
                <span style={{ display: 'inline-block' }}>
                  <EmojiEventsIcon sx={iconCircle('#ffb300', '#fffde7')} />
                </span>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  mb: { xs: 0.5, sm: 1 },
                  fontWeight: 800,
                  color: '#ffb300',
                  letterSpacing: 1,
                  textShadow: '0 2px 8px #ffb30022',
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                }}
              >
                New Tournament
              </Typography>
              <Typography sx={{ mb: { xs: 1, sm: 2 }, color: '#607d8b', fontSize: { xs: 14, sm: 16 } }}>
                Organize a new tournament and invite teams to compete!
              </Typography>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 30,
                  px: { xs: 3, sm: 5 },
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 700,
                  fontSize: { xs: 15, sm: 17 },
                  background: 'linear-gradient(90deg, #ffb300 0%, #1976d2 100%)',
                  color: '#fff',
                  boxShadow: '0 2px 8px #ffb30033',
                  letterSpacing: 1,
                  mt: 1,
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1976d2 0%, #ffb300 100%)',
                  },
                }}
                onClick={() => navigate('/tournament')}
              >
                Create Tournament
              </Button>
            </CardContent>
          </Card>
        </Fade>
        {/* New Match Card */}
        <Fade in timeout={1200}>
          <Card sx={cardStyles('linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%)')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 1, sm: 2 } }}>
                <span style={{ display: 'inline-block' }}>
                  <SportsCricketIcon sx={iconCircle('#43a047', '#e8f5e9')} />
                </span>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  mb: { xs: 0.5, sm: 1 },
                  fontWeight: 800,
                  color: '#43a047',
                  letterSpacing: 1,
                  textShadow: '0 2px 8px #43a04722',
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                }}
              >
                New Match
              </Typography>
              <Typography sx={{ mb: { xs: 1, sm: 2 }, color: '#607d8b', fontSize: { xs: 14, sm: 16 } }}>
                Schedule a new match and start scoring instantly!
              </Typography>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 30,
                  px: { xs: 3, sm: 5 },
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 700,
                  fontSize: { xs: 15, sm: 17 },
                  background: 'linear-gradient(90deg, #43a047 0%, #00bfae 100%)',
                  color: '#fff',
                  boxShadow: '0 2px 8px #43a04733',
                  letterSpacing: 1,
                  mt: 1,
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    background: 'linear-gradient(90deg, #00bfae 0%, #43a047 100%)',
                  },
                }}
                onClick={() => navigate('/match/create')}
              >
                Create Match
              </Button>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Box>
  );
};

export default CreateOptionsPage;