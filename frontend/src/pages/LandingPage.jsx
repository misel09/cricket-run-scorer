import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <video
        className="landing-video"
        autoPlay
        muted
        onEnded={() => navigate('/home')} // Redirect to /home when the video ends
      >
        <source src="/videos/cricket-intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default LandingPage;