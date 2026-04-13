import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Dashboard.css'; // Reuse core match card styles

const PublicSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchPublicResults = async () => {
      try {
        const query = location.search;
        const res = await fetch(`http://localhost:5000/api/users/public/search${query}`);
        const data = await res.json();
        setResults(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchPublicResults();
  }, [location.search]);

  if (loading) return <div className="loading-screen">Searching our verified database...</div>;

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-content">
        <header className="welcome-section">
          <div className="welcome-text">
            <h1 className="premium-gradient-text">Matches Found</h1>
            <p>We found {results.length} verified profiles matching your criteria.</p>
          </div>
          <div className="cta-box card" style={{ background: 'var(--primary)', color: 'white', padding: '1rem 2rem' }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Want to see full details?</p>
            <Link to="/signup" className="btn btn-secondary" style={{ marginTop: '0.5rem', border: '1px solid white', color: 'white' }}>
              Create Free Profile
            </Link>
          </div>
        </header>

        <div className="matches-grid">
          {results.map(user => (
            <div key={user.id} className="match-card card blurred-card">
              <div className="match-image">
                {user.photo ? (
                  <img src={user.photo} alt="Profile" className="blurred-img" />
                ) : (
                  <div className="match-photo-placeholder blurred-img">👤</div>
                )}
                <div className="blur-overlay">
                  <Link to="/signup" className="btn btn-primary">Sign up to View</Link>
                </div>
              </div>
              <div className="match-info">
                <h3>{user.name}, {user.age}</h3>
                <p className="match-location">📍 {user.city || 'Location Hidden'}</p>
                <p className="match-job">💼 {user.job || 'Professional'}</p>
                <div className="match-actions" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                  <button className="btn btn-secondary">Send Interest</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="no-results card" style={{ textAlign: 'center', padding: '4rem' }}>
             <h2>No immediate matches found.</h2>
             <p>Our database grows every hour. Register now to be notified when someone matches your criteria!</p>
             <Link to="/signup" className="btn btn-primary" style={{ marginTop: '1rem' }}>Get Started</Link>
          </div>
        )}
      </div>

      <style>{`
        .blurred-card:hover .blurred-img {
          filter: blur(12px); /* Maintain blur on hover to prevent cheating */
        }
        .blurred-img {
          filter: blur(8px);
          transition: filter 0.3s ease;
        }
        .match-card {
           position: relative;
        }
        .blur-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }
      `}</style>
    </div>
  );
};

export default PublicSearch;
