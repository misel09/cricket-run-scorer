// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import pages/components
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MatchPage from './pages/MatchPage';
import SummaryPage from './pages/SummaryPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import CreatePage from './pages/CreatePage';
import TournamentPage from './pages/TournamentPage';
import TournamentInfoPage from './pages/TournamentInfoPage'; // adjust path as needed
import CricketPage from './pages/MyCricketPage'; // adjust path as needed
import Creatematch from './pages/Creatematch'; // Make sure the path is correct
import LiveMatchPage from './pages/LiveMatchPage'; // Import the new LiveMatchPage component
import JoinTeamPage from './pages/JoinTeamPage';
import MatchDetailsPage from './pages/MatchDetailsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Landing Page */}
          <Route path="/home" element={<HomePage />} /> {/* Home Page */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/tournament" element={<TournamentPage />} />
          <Route path="/tournament/:id" element={<TournamentInfoPage />} />
          <Route path="/cricket" element={<CricketPage />} />
          <Route path="/match/create" element={<Creatematch />} />
          <Route path="/match/live" element={<LiveMatchPage />} /> {/* New route for live match page */}
          <Route path="/join-team" element={<JoinTeamPage />} /> {/* New route for join team page */}
          <Route path="/match/:matchId" element={<MatchDetailsPage />} /> {/* New route for match details page */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
