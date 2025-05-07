import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await api.get('/elections');
      setElections(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch elections');
      setLoading(false);
    }
  };

  const handleVote = async (electionId, candidateId) => {
    try {
      await api.post('/votes', { electionId, candidateId });
      setVoteSuccess(true);
      // Refresh elections to update vote counts
      fetchElections();
      setTimeout(() => setVoteSuccess(false), 3000);
    } catch (err) {
      setError('Failed to submit vote');
    }
  };

  if (!isAuthenticated) {
    return <div className="dashboard-container">Please log in to view your dashboard.</div>;
  }

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.name}!</h1>
      
      {error && <div className="error-message">{error}</div>}
      {voteSuccess && <div className="success-message">Vote submitted successfully!</div>}

      <div className="elections-grid">
        {elections.map(election => (
          <div key={election._id} className="election-card">
            <h2>{election.title}</h2>
            <p>{election.description}</p>
            <p>Status: {election.status}</p>
            
            {election.status === 'active' && (
              <div className="candidates-list">
                {election.candidates.map(candidate => (
                  <div key={candidate._id} className="candidate-item">
                    <span>{candidate.name}</span>
                    <button 
                      onClick={() => handleVote(election._id, candidate._id)}
                      className="vote-button"
                    >
                      Vote
                    </button>
                  </div>
                ))}
              </div>
            )}

            {election.status === 'completed' && (
              <div className="results">
                <h3>Results:</h3>
                {election.candidates.map(candidate => (
                  <div key={candidate._id} className="result-item">
                    <span>{candidate.name}</span>
                    <span>{candidate.votes} votes</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 