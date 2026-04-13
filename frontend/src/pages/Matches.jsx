import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/interests/matches`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMatches(data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) return <div className="loading-state">Finding your connections...</div>;

  return (
    <div className="matches-page">
      <Navbar />
      
      <main className="matches-content">
        <div className="matches-header">
           <h1 className="premium-gradient-text">Your Matches</h1>
           <p className="subtitle">People you are connected with. Start a conversation!</p>
        </div>

        {matches.length > 0 ? (
          <div className="matches-grid">
            {matches.map(match => (
              <div key={match.id} className="match-card card shadow-sm">
                <div className="match-photo-wrapper">
                  {match.photo ? (
                    <img src={match.photo} alt={match.name} className="match-photo" />
                  ) : (
                    <div className="match-photo-placeholder">{match.name.charAt(0)}</div>
                  )}
                  <div className="match-overlay">
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/chat/${match.matchId}`)}>Chat Now 💬</button>
                  </div>
                </div>
                <div className="match-details">
                  <h3>{match.name}</h3>
                  <p>{match.age} yrs • {match.city}</p>
                  <button className="view-profile-btn" onClick={() => navigate(`/profile/${match.id}`)}>
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-matches card shadow-sm">
            <span className="empty-icon">❤️</span>
            <h3>No Matches Yet</h3>
            <p>Don't worry! Keep exploring profiles and sending interests. Your perfect match is out there.</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Explore Profiles
            </button>
          </div>
        )}
      </main>

      <style jsx="true">{`
        .matches-page {
          min-height: 100vh;
          background: #fdfafb;
          padding-bottom: 80px;
        }
        .matches-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .matches-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .matches-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .matches-header .subtitle {
          color: #666;
          font-size: 1.1rem;
        }

        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        .match-card {
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: white;
        }
        .match-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
        }

        .match-photo-wrapper {
          position: relative;
          height: 320px;
          background: #eee;
        }
        .match-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .match-photo-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
          background: linear-gradient(135deg, #800000, #b22222);
          color: white;
          font-weight: 700;
        }

        .match-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 1.5rem;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          display: flex;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .match-card:hover .match-overlay {
          opacity: 1;
        }

        .match-details {
          padding: 1.5rem;
          text-align: center;
        }
        .match-details h3 {
          margin-bottom: 0.3rem;
          font-size: 1.3rem;
          color: var(--text-color);
        }
        .match-details p {
          color: #666;
          margin-bottom: 1.2rem;
        }

        .view-profile-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .empty-matches {
          text-align: center;
          padding: 5rem 2rem;
          background: white;
          border-radius: 30px;
        }
        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }
        .empty-matches h3 { font-size: 1.8rem; margin-bottom: 1rem; }
        .empty-matches p { color: #666; margin-bottom: 2.5rem; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.6; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @media (max-width: 768px) {
          .matches-grid {
            grid-template-columns: 1fr;
          }
          .match-photo-wrapper {
            height: 400px;
          }
          .match-overlay {
             opacity: 1;
             background: transparent;
             bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Matches;
