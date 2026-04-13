import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth data (this will be wired up later)
    localStorage.removeItem('token');
    navigate('/');
  };

  const name = user?.name || 'User';
  const initial = name.charAt(0).toUpperCase();

  return (
    <nav className="navbar main-navbar">
      <div className="navbar-container">
        <div className="nav-section-left">
          <Link to="/" className="navbar-logo-container">
            <img src={logo} alt="MangalyamMatch Logo" className="navbar-logo-img" />
            <span className="navbar-logo-text premium-gradient-text">
              MangalyamMatch
            </span>
          </Link>
        </div>

        <div className="nav-section-center desktop-only">
          <div className="navbar-links">
            {user && <Link to="/browse">Find Matches</Link>}
          </div>
        </div>

        <div className="nav-section-right">
          <div className="navbar-actions">
            {user ? (
              <div className="navbar-profile">
                <div className="nav-profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
                  <div className="nav-avatar">{initial}</div>
                  <span className="nav-user-name">{name}</span>
                  <i className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</i>
                </div>
                
                {showDropdown && (
                  <div className="nav-dropdown card">
                    <Link to="/dashboard" onClick={() => setShowDropdown(false)}>My Dashboard</Link>
                    <Link to="/profile" onClick={() => setShowDropdown(false)}>My Profile</Link>
                    <Link to="/pricing" onClick={() => setShowDropdown(false)}>Upgrade</Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn-text">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Join Free</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
