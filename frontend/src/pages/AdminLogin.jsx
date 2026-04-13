import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthStyles.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAdmin', 'true');
      
      // Navigate to admin dashboard
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-login-bg">
      <div className="auth-card card">
        <div className="admin-badge">ADMIN PANEL</div>
        <h2 className="premium-gradient-text">Secure Access</h2>
        <p className="auth-subtitle">MangalyamMatch Command Center</p>

        {error && <div className="auth-error card" style={{ color: 'red', marginBottom: '1rem', background: '#ffebeb' }}>{error}</div>}
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin Username" 
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Admin Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit admin-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
        
        <div className="auth-redirect">
          <button onClick={() => navigate('/login')} className="btn-link">Back to Member Login</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
