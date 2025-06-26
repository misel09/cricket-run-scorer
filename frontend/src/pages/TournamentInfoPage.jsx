import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TournamentInfoPage = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/tournament/${id}`)
      .then(res => res.json())
      .then(data => setTournament(data));
  }, [id]);

  if (!tournament) return <div>Loading...</div>;

  return (
    <div>
      <h2>{tournament.name}</h2>
      <p>Start Date: {tournament.startDate}</p>
      {/* Add more tournament info here */}
    </div>
  );
};

export default TournamentInfoPage;