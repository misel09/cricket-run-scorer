import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  InputAdornment,
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://cricket-run-scorer-mk3xfot95-misel-patels-projects.vercel.app/login', {
        email,
        password,
      });

      // ✅ Save logged-in user data to localStorage
      localStorage.setItem('userEmail', response.data.user.email);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      alert(response.data.message);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundImage: 'url("/images/bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: '2rem',
          borderRadius: '15px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome Back!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please log in to continue.
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#6a11cb' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#6a11cb' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #2575fc, #6a11cb)',
              },
            }}
          >
            Log In
          </Button>
        </form>
        <Typography variant="body2" sx={{ marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link href="/register" sx={{ color: '#6a11cb', fontWeight: 'bold' }}>
            Register here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
