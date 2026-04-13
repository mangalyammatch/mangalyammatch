import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import './AuthStyles.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed');

      alert('Email verified successfully! You can now complete your profile.');
      localStorage.setItem('isVerified', 'true');
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Session expired. Please sign up again.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }
      
      alert(data.message || 'OTP resent successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartOver = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isVerified');
    navigate('/signup');
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h2 className="premium-gradient-text">Verify Email</h2>
        <p className="auth-subtitle">We sent a 6-digit code to <strong>{email}</strong></p>
        
        {error && <div className="auth-error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleVerify} className="auth-form">
          <div className="form-group">
            <label>6-Digit Code</label>
            <input 
              type="text" 
              maxLength="6"
              required 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000" 
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        
        <div className="auth-redirect">
          Didn't receive code? <button onClick={handleResend} className="btn-link" style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>
        </div>
        <div className="auth-redirect" style={{ marginTop: '0.5rem' }}>
          Entered wrong email? <button onClick={handleStartOver} className="btn-link" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Start Over / Sign Up Again</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
