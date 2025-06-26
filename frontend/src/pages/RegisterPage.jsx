import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link, Paper } from '@mui/material';
import { Person, Email, Lock, Phone } from '@mui/icons-material'; // Import icons
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState(''); // State for mobile number
  const navigate = useNavigate(); // Initialize useNavigate

  const handleRegister = async (e) => {
    e.preventDefault();

    console.log('Register button clicked');
    console.log('Registering with:', { name, email, password, mobile });

    try {
      const response = await axios.post('http://192.168.125.42:5000/register', {
        name,
        email,
        password,
        mobile,
      });
      alert(response.data.message);
      navigate('/login'); // Redirect to Login Page
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
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
        backgroundSize: 'cover', // Ensure the image covers the entire container
        backgroundPosition: 'center', // Center the image
        backgroundRepeat: 'no-repeat', // Prevent the image from repeating
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
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Create an Account
        </Typography>
        <Typography variant="body1" gutterBottom>
          Join us and start scoring your matches!
        </Typography>
        <form onSubmit={handleRegister}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <Person sx={{ color: '#6a11cb', marginRight: '8px' }} />
              ),
            }}
          />
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
                <Email sx={{ color: '#6a11cb', marginRight: '8px' }} />
              ),
            }}
          />
          <TextField
            label="Mobile Number"
            type="tel"
            variant="outlined"
            fullWidth
            margin="normal"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <Phone sx={{ color: '#6a11cb', marginRight: '8px' }} />
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
                <Lock sx={{ color: '#6a11cb', marginRight: '8px' }} />
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
              background: 'linear-gradient(135deg, #6a11cb, #2575fc)', // Same button gradient as LoginPage
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #2575fc, #6a11cb)',
              },
            }}
          >
            Register
          </Button>
        </form>
        <Typography variant="body2" sx={{ marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link href="/login" sx={{ color: '#6a11cb', fontWeight: 'bold' }}>
            Log in here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
