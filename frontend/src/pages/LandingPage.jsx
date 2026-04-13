import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [publicProfiles, setPublicProfiles] = useState([]);
  const [searchParams, setSearchParams] = useState({
    gender: 'Bride',
    ageFrom: '20',
    ageTo: '35',
    religion: 'All'
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/users/public/search')
      .then(res => res.json())
      .then(data => setPublicProfiles(data.slice(0, 4)))
      .catch(err => console.error('Failed to fetch public profiles:', err));
  }, []);

  const handleSearch = () => {
    const query = new URLSearchParams(searchParams).toString();
    navigate(`/search?${query}`);
  };
  return (
    <div className="landing-page">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">MangalyamMatch</h1>
          <p className="hero-subtitle mb-0">"Uniting Hearts for a Lifetime"</p>
          <p className="hero-malayalam">
            ജീവിതകാലം മുഴുവൻ നീളുന്ന ബന്ധത്തിനായി, മനസ്സുകളുടെ യഥാർത്ഥ പൊരുത്തം കണ്ടെത്തുന്ന വിശ്വസനീയ വേദി.
          </p>
          <p className="hero-description">
            The premium platform for serious marriage seekers in Kerala. Find your perfect match with our intelligent compatibility system.
          </p>
          
          {/* Public Search Widget */}
          <div className="search-widget-container">
            <div className="search-widget card">
              <div className="search-form">
                <div className="search-group">
                  <label>Looking For</label>
                  <select 
                    value={searchParams.gender} 
                    onChange={(e) => setSearchParams({...searchParams, gender: e.target.value})}
                  >
                    <option value="Bride">Bride</option>
                    <option value="Groom">Groom</option>
                  </select>
                </div>
                
                <div className="search-divider"></div>
                
                <div className="search-group">
                  <label>Age Range</label>
                  <div className="age-inputs">
                    <input 
                      type="number" 
                      value={searchParams.ageFrom} 
                      onChange={(e) => setSearchParams({...searchParams, ageFrom: e.target.value})}
                      min="18" 
                    />
                    <span className="to">to</span>
                    <input 
                      type="number" 
                      value={searchParams.ageTo} 
                      onChange={(e) => setSearchParams({...searchParams, ageTo: e.target.value})}
                      min="18" 
                    />
                  </div>
                </div>

                <div className="search-divider"></div>

                <div className="search-group">
                  <label>Religion</label>
                  <select 
                    value={searchParams.religion} 
                    onChange={(e) => setSearchParams({...searchParams, religion: e.target.value})}
                  >
                    <option value="All">All Religions</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Christian">Christian</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Jain">Jain</option>
                  </select>
                </div>

                <button className="btn btn-primary search-btn" onClick={handleSearch}>
                  Search Matches
                </button>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary" style={{ marginRight: '1rem', padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Create Profile
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Browse Matches
            </Link>
          </div>
        </div>
        <div className="hero-image-container">
          <img src="/hero_wedding_couple.png" alt="Happy Indian Match" className="hero-image" />
          <div className="floating-card c2">Verified Profiles 🛡️</div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="how-it-works">
        <h2>How MangalyamMatch Works</h2>
        <div className="steps-container">
          <div className="step-card card">
            <div className="step-number">1</div>
            <h3>Create Profile</h3>
            <p>Sign up and tell us about your lifestyle, values, and what you're looking for.</p>
          </div>
          <div className="step-card card">
            <div className="step-number">2</div>
            <h3>Smart Matching</h3>
            <p>Our algorithm finds verified profiles that share your compatibility factors.</p>
          </div>
          <div className="step-card card">
            <div className="step-number">3</div>
            <h3>Connect & Marry</h3>
            <p>Send interests securely and take the first step towards your lifetime union.</p>
          </div>
        </div>
      </section>

      {/* Featured Profiles (Real but Blurred) */}
      {publicProfiles.length > 0 && (
        <section className="featured-profiles">
          <h2>Featured Matches</h2>
          <div className="profiles-grid">
            {publicProfiles.map((profile) => (
              <div key={profile.id} className="profile-card card blurred">
                <div className="profile-img-placeholder">
                  {profile.photo ? <img src={profile.photo} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{profile.name.charAt(0)}</span>}
                </div>
                <div className="profile-details">
                  <h4>{profile.name}</h4>
                  <p>{profile.age} yrs • {profile.job || 'Member'}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {profile.city || profile.religion}</p>
                  <div className="blur-overlay">
                    <Link to="/login" className="btn btn-primary btn-sm">Login to View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="trust-section">
        <div className="trust-badges">
          <div className="badge">100% Verified Profiles</div>
          <div className="badge">Secure & Private</div>
          <div className="badge">Premium Support</div>
        </div>
      </section>

      {/* Join Us From The Beginning */}
      <section id="join-us" className="success-stories">
        <h2>Be One of the First!</h2>
        <div className="stories-grid">
          <div className="story-card card" style={{ maxWidth: '600px', textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>A New Era in Premium Matrimony</h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
              MangalyamMatch is a brand-new, highly curated platform. We're rejecting the clutter and superficiality of traditional matrimony sites. By joining today, you become part of our exclusive founding community. 
              <br/><br/>
              Start your journey with us and be the first to find meaningful lifetime connections!
            </p>
          </div>
        </div>
      </section>

      {/* Membership Plans Preview */}
      <section className="membership-preview">
        <h2>Exclusive Startup Plan</h2>
        <div className="plans-grid">
          <div className="plan-card card premium-card" style={{ maxWidth: '500px', width: '100%' }}>
            <h3>Early Adopter Premium</h3>
            <div className="price">₹0<span> for 3 Months</span></div>
            <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>As a thank you to our founding members</p>
            <ul style={{ textAlign: 'center', paddingLeft: '0' }}>
               <li><span style={{color: 'green'}}>✓</span> Unlimited interests & Matches</li>
               <li><span style={{color: 'green'}}>✓</span> View full profiles and Unblur photos</li>
               <li><span style={{color: 'green'}}>✓</span> Direct chat messaging</li>
               <li><span style={{color: 'green'}}>✓</span> Priority visibility</li>
            </ul>
            <Link to="/signup" className="btn btn-primary">Claim 3 Months Free</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 MangalyamMatch. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
