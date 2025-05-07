import React, { useState } from 'react';
import api from '../../api';

const MFAPrompt = ({ email, tempToken, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // If using tempToken (for login), send it; otherwise, use email
      if (tempToken) {
        await api.post('/auth/verify-mfa', { tempToken, mfaCode: code });
      } else {
        await api.post('/auth/verify-mfa', { email, code });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired MFA code.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendStatus('');
    setError('');
    try {
      await api.post('/auth/resend-mfa', { email });
      setResendStatus('A new MFA code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend MFA code.');
    }
  };

  return (
    <div className="container">
      <h2>Enter MFA Code</h2>
      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label>Code</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} required />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {resendStatus && <div className="alert alert-success">{resendStatus}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      <button type="button" className="btn btn-secondary" style={{marginTop: '1rem'}} onClick={handleResend}>
        Resend MFA code
      </button>
    </div>
  );
};

export default MFAPrompt; 