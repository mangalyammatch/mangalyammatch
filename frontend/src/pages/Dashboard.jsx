import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [me, setMe] = useState(null);
  const [matches, setMatches] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const [meRes, matchesRes, pendingRes, myMatchesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/users/matches`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/interests/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/interests/matches`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!meRes.ok || !matchesRes.ok || !pendingRes.ok || !myMatchesRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const meData = await meRes.json();
        const matchesData = await matchesRes.json();
        const pendingData = await pendingRes.json();
        const myMatchesData = await myMatchesRes.json();

        setMe({
          ...meData.profile,
          completion: meData.completion,
          isVerified: meData.isVerified,
          isPremium: meData.profile.isPremium || true // Assume trial
        });
        setMatches(matchesData);
        setInterests(pendingData);
        setMyMatches(myMatchesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const sendInterest = async (receiverId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/interests/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId })
      });
      if (res.ok) {
        alert('Interest sent successfully! ❤️');
        // Update local state to show "Sent"
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send interest');
      }
    } catch (err) {
      alert('Network error while sending interest');
    }
  };

  const handleInterest = async (interestId, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/interests/handle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ interestId, status })
      });
      
      if (res.ok) {
        // Refresh interests and matches
        setInterests(interests.filter(i => i.id !== interestId));
        if (status === 'ACCEPTED') {
          // Re-fetch matches to show the new match
          const matchesRes = await fetch(`${API_BASE_URL}/api/interests/matches`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (matchesRes.ok) {
            const data = await matchesRes.json();
            setMyMatches(data);
          }
        }
      }
    } catch (err) {
      alert('Failed to process interest');
    }
  };

  if (loading) return <div className="loading-state">Initializing your dashboard...</div>;
  if (!me) return (
    <div className="onboarding-prompt-container">
      <div className="prompt-card card shadow-lg">
        <h2 className="premium-gradient-text">Welcome to MangalyamMatch</h2>
        <p>You're almost there! To start finding your perfect partner, please complete your profile setup.</p>
        <button className="btn btn-primary" onClick={() => navigate('/onboarding')}>
          Finish Setting Up Profile
        </button>
      </div>
      <style jsx="true">{`
        .onboarding-prompt-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #f8f9fa;
        }
        .prompt-card {
          max-width: 400px;
          text-align: center;
          padding: 2.5rem;
          border-radius: 20px;
        }
        .prompt-card h2 { margin-bottom: 1rem; }
        .prompt-card p { margin-bottom: 2rem; color: #666; }
      `}</style>
    </div>
  );

  return (
    <div className="dashboard-page instagram-theme">
      <Navbar user={me} />
      
      <main className="dashboard-content feed-layout">
        
        {/* PROFILE HEADER (Instagram Style) */}
        <section className="profile-header-section card shadow-sm">
          <div className="profile-header-top">
            <div className="avatar-wrapper">
              <div className="main-avatar">
                 {me.photos ? (
                   <img src={me.photos.split(',')[0]} alt={me.name} />
                 ) : (
                   <span className="avatar-placeholder">{me.name.charAt(0)}</span>
                 )}
              </div>
            </div>
            <div className="profile-header-info">
              <div className="id-row">
                <h2 className="username">{me.name}</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/profile')}>Edit Profile</button>
              </div>
              <div className="stats-row">
                <div className="stat-item"><strong>{matches.length}</strong> matches</div>
                <div className="stat-item"><strong>{myMatches.length}</strong> connections</div>
                <div className="stat-item"><strong>{interests.length}</strong> requests</div>
              </div>
              <div className="bio-row">
                 <p className="full-name">{me.job || 'Verified Member'}</p>
                 <p className="location">📍 {me.city || me.location}</p>
                 <div className="completion-bar-container">
                    <span>Profile {me.completion}%</span>
                    <div className="completion-bar"><div className="fill" style={{width: `${me.completion}%`}}></div></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEED CONTENT */}
        <div className="feed-container">
          <div className="feed-header">
            <h3>Find Your Perfect Match</h3>
            <div className="feed-tabs">
               <button className={activeTab === 'browse' ? 'active' : ''} onClick={() => setActiveTab('browse')}>Feed</button>
               <button className={activeTab === 'received' ? 'active' : ''} onClick={() => setActiveTab('received')}>Requests</button>
               <button className={activeTab === 'my-matches' ? 'active' : ''} onClick={() => setActiveTab('my-matches')}>Connections</button>
            </div>
          </div>

          <div className="feed-posts">
            {activeTab === 'browse' && (
              matches.length > 0 ? matches.map(match => (
                <div key={match.id} className="post-card card">
                  <div className="post-header">
                    <div className="tiny-avatar">{match.name.charAt(0)}</div>
                    <div className="post-user-info">
                      <span className="post-name">{match.name}</span>
                      <span className="post-location">{match.location || 'India'}</span>
                    </div>
                    <div className="post-compatibility">{match.compatibility}% Match</div>
                  </div>
                  <div className="post-image">
                    {match.photo ? <img src={match.photo} alt={match.name} /> : <div className="placeholder-img">{match.name.charAt(0)}</div>}
                  </div>
                  <div className="post-actions">
                    <button className="action-btn heart" onClick={() => sendInterest(match.id)}>❤️</button>
                    <button className="action-btn comment" onClick={() => navigate(`/profile/${match.id}`)}>👁️</button>
                    <button className="action-btn share">🔗</button>
                  </div>
                  <div className="post-details">
                    <p><strong>{match.name}, {match.age}</strong> • {match.job}</p>
                    <button className="view-profile-link" onClick={() => navigate(`/profile/${match.id}`)}>View full profile</button>
                  </div>
                </div>
              )) : <div className="empty-feed">No profiles found.</div>
            )}

            {activeTab === 'received' && (
              interests.length > 0 ? interests.map(int => (
                <div key={int.id} className="request-card card">
                   <div className="req-header">
                      <div className="req-avatar">{int.sender.profile.name.charAt(0)}</div>
                      <div className="req-info">
                        <strong>{int.sender.profile.name}</strong> sent you a request
                        <span>{int.sender.profile.city} • {int.sender.profile.age} yrs</span>
                      </div>
                   </div>
                   <div className="req-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleInterest(int.id, 'ACCEPTED')}>Accept</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleInterest(int.id, 'DECLINED')}>Ignore</button>
                   </div>
                </div>
              )) : <div className="empty-feed">No pending requests.</div>
            )}

            {activeTab === 'my-matches' && (
              myMatches.length > 0 ? myMatches.map(m => (
                <div key={m.matchId} className="post-card card">
                  <div className="post-header">
                    <div className="tiny-avatar">{m.name.charAt(0)}</div>
                    <div className="post-user-info">
                      <span className="post-name">{m.name}</span>
                      <span className="post-location">{m.city}</span>
                    </div>
                  </div>
                  <div className="post-image">
                    {m.photo ? <img src={m.photo} alt={m.name} /> : <div className="placeholder-img">{m.name.charAt(0)}</div>}
                  </div>
                  <div className="post-actions">
                    <button className="btn btn-primary" onClick={() => navigate(`/chat/${m.matchId}`)}>Send Message 💬</button>
                    <button className="btn btn-secondary" onClick={() => navigate(`/profile/${m.id}`)}>Profile</button>
                  </div>
                </div>
              )) : <div className="empty-feed">No connections yet.</div>
            )}
          </div>
        </div>
      </main>

      <style jsx="true">{`
        .user-status-badges {
          display: flex;
          gap: 0.5rem;
          margin: 0.5rem 0 1rem;
        }
        .badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .badge.verified { background: #e8f5e9; color: #2e7d32; }
        .badge.premium { background: #fff8e1; color: #fbc02d; border: 1px solid #ffe082; }
        
        .interests-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border-left: 5px solid var(--primary);
        }
        .interest-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #eee;
        }
        .interest-item:last-child { border-bottom: none; }
        .interest-user { display: flex; align-items: center; gap: 1rem; }
        .tiny-avatar {
          width: 35px; height: 35px; border-radius: 50%;
          background: #eee; display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 0.8rem;
        }

        .tab-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
        }
        .tab-btn {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
          position: relative;
        }
        .tab-btn.active {
          color: var(--primary);
        }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary);
        }
        
        .no-matches-found {
          grid-column: 1 / -1;
          padding: 3rem;
          text-align: center;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
