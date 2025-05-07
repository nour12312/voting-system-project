import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ name: '' }]
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchElections();
    }
  }, [user]);

  const fetchElections = async () => {
    try {
      const response = await api.get('/elections/admin');
      setElections(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch elections');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewElection(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCandidateChange = (index, value) => {
    const updatedCandidates = [...newElection.candidates];
    updatedCandidates[index] = { name: value };
    setNewElection(prev => ({
      ...prev,
      candidates: updatedCandidates
    }));
  };

  const addCandidate = () => {
    setNewElection(prev => ({
      ...prev,
      candidates: [...prev.candidates, { name: '' }]
    }));
  };

  const removeCandidate = (index) => {
    setNewElection(prev => ({
      ...prev,
      candidates: prev.candidates.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/elections', newElection);
      setNewElection({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        candidates: [{ name: '' }]
      });
      fetchElections();
    } catch (err) {
      setError('Failed to create election');
    }
  };

  const handleStatusChange = async (electionId, newStatus) => {
    try {
      await api.patch(`/elections/${electionId}`, { status: newStatus });
      fetchElections();
    } catch (err) {
      setError('Failed to update election status');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="admin-container">Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <div className="admin-container">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      
      {error && <div className="error-message">{error}</div>}

      <section className="create-election">
        <h2>Create New Election</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={newElection.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={newElection.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="datetime-local"
              name="startDate"
              value={newElection.startDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date:</label>
            <input
              type="datetime-local"
              name="endDate"
              value={newElection.endDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="candidates-section">
            <h3>Candidates</h3>
            {newElection.candidates.map((candidate, index) => (
              <div key={index} className="candidate-input">
                <input
                  type="text"
                  value={candidate.name}
                  onChange={(e) => handleCandidateChange(index, e.target.value)}
                  placeholder="Candidate name"
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeCandidate(index)}
                    className="remove-candidate"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addCandidate} className="add-candidate">
              Add Candidate
            </button>
          </div>

          <button type="submit" className="submit-button">Create Election</button>
        </form>
      </section>

      <section className="manage-elections">
        <h2>Manage Elections</h2>
        <div className="elections-list">
          {elections.map(election => (
            <div key={election._id} className="election-item">
              <h3>{election.title}</h3>
              <p>{election.description}</p>
              <p>Status: {election.status}</p>
              <div className="election-actions">
                <select
                  value={election.status}
                  onChange={(e) => handleStatusChange(election._id, e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel; 