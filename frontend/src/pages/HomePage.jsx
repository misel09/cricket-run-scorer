import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star'; // Import Material-UI Star Icon
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartMatch = () => {
    navigate('/login'); // Redirect to the login page
  };

  const features = [
    {
      id: 1,
      text: '📊 Real-time score tracking',
      description: 'Track scores in real-time as the match progresses, ensuring you never miss a moment.',
    },
    {
      id: 2,
      text: '📈 Detailed match statistics',
      description: 'Get comprehensive statistics for every match, including player performance and team insights.',
    },
    {
      id: 3,
      text: '🌟 Easy-to-use interface',
      description: 'Enjoy a user-friendly interface designed for quick and hassle-free navigation.',
    },
  ];

  return (
    <div className="home-container">
      <div className="content">
        <h1 className="title">🏏 Cricket Run Scorer</h1>
        <p className="subtitle">Track your matches and scores effortlessly!</p>
        <button className="start-button" onClick={handleStartMatch}>
          Start
        </button>
      </div>

      <div className="features-container">
        {features.map((feature) => (
          <div key={feature.id} className="feature-card">
            <StarIcon className="feature-icon" />
            <h3 className="feature-title">{feature.text}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
