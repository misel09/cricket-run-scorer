import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './SummaryPage.css'; // Make sure this file exists or remove this line if not needed

const SummaryPage = () => {
  const location = useLocation();
  const { teamA, teamB, overs, numPlayers } = location.state || {};

  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get('<http:192 className="168 0 103"></http:192>:5000/api/matches');
        setMatches(response.data);
      } catch (error) {
        console.error('Error fetching match data:', error);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="summary-page">
      <h2>Match Summary</h2>
      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul>
          {matches.map((match, index) => (
            <li key={index}>
              <strong>{match.teamA}</strong> vs <strong>{match.teamB}</strong><br />
              Winner: <strong>{match.winner}</strong><br />
              Date: {new Date(match.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
      <div className="summary-container">
        <h1>Match Details</h1>
        <p>Team A: {teamA}</p>
        <p>Team B: {teamB}</p>
        <p>Overs: {overs}</p>
        <p>Number of Players: {numPlayers}</p>
        {/* Add more details or actions here */}
      </div>
    </div>
  );
};

export default SummaryPage;
