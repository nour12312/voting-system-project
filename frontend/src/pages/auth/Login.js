import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import MFAPrompt from './MFAPrompt';

const Login = () => {
  const { login, error, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setLocalError('');
    const result = await login(email, password);
    if (result && result.mfa) {
      setShowMFA(true);
      setTempToken(result.tempToken);
    } else if (result && result.error) {
      // Field-specific error handling
      if (result.error.toLowerCase().includes('email')) {
        setEmailError(result.error);
      } else if (result.error.toLowerCase().includes('password')) {
        setPasswordError(result.error);
      } else {
        setLocalError(result.error);
      }
    }
  };

  if (showMFA) {
    return <MFAPrompt email={email} tempToken={tempToken} onSuccess={() => window.location.href = '/dashboard'} />;
  }

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          {emailError && <div className="alert alert-error">{emailError}</div>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {passwordError && <div className="alert alert-error">{passwordError}</div>}
        </div>
        {localError && <div className="alert alert-error">{localError}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{marginTop: '1rem'}}>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    </div>
  );
};

export default Login; 