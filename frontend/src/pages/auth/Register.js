import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import MFAPrompt from './MFAPrompt';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 special char
  const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return re.test(password);
};

const Register = () => {
  const { register, error, loading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showMFA, setShowMFA] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setEmailError('');
    setPasswordError('');
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters, include 1 uppercase letter and 1 special character.');
      valid = false;
    }
    if (!valid) return;

    const result = await register(name, email, password);
    if (result && result.mfa) {
      setShowMFA(true);
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
    return <MFAPrompt email={email} onSuccess={() => window.location.href = '/dashboard'} />;
  }

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div style={{marginTop: '1rem', color: '#888', fontSize: '0.95rem'}}>
        Password must be at least 8 characters, include 1 uppercase letter and 1 special character.
      </div>
    </div>
  );
};

export default Register; 