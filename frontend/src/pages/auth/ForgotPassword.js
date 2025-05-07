import React, { useState } from 'react';
import api from '../../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('A reset code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Something went wrong!');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword; 