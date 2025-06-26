import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Matchpage.css'; // Ensure the file name matches

const MatchPage = () => {
  const navigate = useNavigate();
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [overs, setOvers] = useState('');
  const [numPlayers, setNumPlayers] = useState(''); // State for the number of players

  const handleStartScoring = () => {
    if (teamA && teamB && overs && numPlayers) {
      // Navigate to the summary or scoring page
      navigate('/summary', { state: { teamA, teamB, overs, numPlayers } });
    } else {
      alert('Please fill in all fields before starting the match.');
    }
  };

  return (
    <div className="match-container">
      <h1>Setup Match</h1>
      <form>
        <div>
          <label>Team A:</label>
          <input
            type="text"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            placeholder="Enter Team A Name"
          />
        </div>
        <div>
          <label>Team B:</label>
          <input
            type="text"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            placeholder="Enter Team B Name"
          />
        </div>
        <div>
          <label>Overs:</label>
          <input
            type="number"
            value={overs}
            onChange={(e) => setOvers(e.target.value)}
            placeholder="Enter Number of Overs"
          />
        </div>
        <div>
          <label>Number of Players:</label>
          <input
            type="number"
            value={numPlayers}
            onChange={(e) => setNumPlayers(e.target.value)}
            placeholder="Enter Number of Players"
          />
        </div>
        <button type="button" onClick={handleStartScoring}>
          Start Scoring
        </button>
      </form>
    </div>
  );
};

export default MatchPage;
