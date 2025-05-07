import React, { useState } from 'react';
import api from '../../api';

const validatePassword = (password) => {
  const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return re.test(password);
};

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setPasswordError('');
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters, include 1 uppercase letter and 1 special character.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, password });
      setMessage('Password has been reset. You can now log in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Reset Code</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {passwordError && <div className="alert alert-error">{passwordError}</div>}
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <div style={{marginTop: '1rem', color: '#888', fontSize: '0.95rem'}}>
        Password must be at least 8 characters, include 1 uppercase letter and 1 special character.
      </div>
    </div>
  );
};

export default ResetPassword; 