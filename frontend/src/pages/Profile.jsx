import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // If 'id' is present, fetch that user's profile, else fetch 'me'
        const url = id ? `http://localhost:5000/api/users/profile/${id}` : 'http://localhost:5000/api/users/me';
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Unabled to load profile');

        const data = await response.json();
        // data structure for 'me' is {profile: {...}, completion: 80}
        // data structure for other user is {profile...} directly (now with user object included)
        setProfile(id ? data : data.profile);
        
        // If it's another user, we might need to fetch our own status to check for match
        if (id) {
          const myMatchesRes = await fetch('http://localhost:5000/api/interests/matches', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (myMatchesRes.ok) {
            const myMatches = await myMatchesRes.json();
            const existingMatch = myMatches.find(m => m.id === id);
            if (existingMatch) {
              setProfile(prev => ({ ...prev, matchId: existingMatch.matchId, isMatched: true }));
            }
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, navigate]);

  const handleSave = async () => {
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      
      let updatedProfile = { ...profile };

      // Handle Image Upload
      if (filesToUpload.length > 0) {
         if (filesToUpload.length < 2 || filesToUpload.length > 5) {
            alert('Please select between 2 and 5 images.');
            setIsUploading(false);
            return;
         }
         
         const formData = new FormData();
         filesToUpload.forEach(file => formData.append('photos', file));

         const uploadRes = await fetch('http://localhost:5000/api/upload', {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${token}` },
           body: formData
         });

         if (!uploadRes.ok) throw new Error('Image upload failed');

         const uploadData = await uploadRes.json();
         updatedProfile.photos = uploadData.urls.join(',');
      } else {
         const currentPhotos = profile.photos ? profile.photos.split(',') : [];
         if (currentPhotos.length < 2) {
             alert('You must have at least 2 photos in your profile.');
             setIsUploading(false);
             return;
         }
      }

      // Save Profile Data
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
      });
      
      if (res.ok) {
        setProfile(updatedProfile);
        setIsEditMode(false);
        setIsUploading(false);
        setFilesToUpload([]);
        alert('Profile updated successfully! ✨');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }
    } catch (err) {
      setIsUploading(false);
      alert(err.message);
    }
  };

  const sendInterest = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/interests/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: id })
      });
      if (res.ok) {
        alert('Interest sent successfully! ❤️');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send interest');
      }
    } catch (err) {
      alert('Network error while sending interest');
    }
  };

  const handleChat = () => {
    if (profile.matchId) {
      navigate(`/chat/${profile.matchId}`);
    } else {
      alert('You can only chat after both of you have accepted interest.');
    }
  };

  if (loading) return <div className="loading-state">Loading Profile...</div>;
  if (!profile) return <div className="error-state">Profile not found.</div>;

  return (
    <div className="profile-container">
      <Navbar user={profile} />

      <main className="profile-layout">
        
        {/* LEFT SIDEBAR (Desktop) / TOP (Mobile) */}
        <aside className="profile-sidebar">
          <div className="main-profile-photo card">
            {isEditMode && filesToUpload.length > 0 ? (
              <img src={URL.createObjectURL(filesToUpload[0])} alt="Preview" />
            ) : profile.photos ? (
              <img src={profile.photos.split(',')[0]} alt={profile.name} />
            ) : (
              <div className="photo-placeholder">{profile.name.charAt(0)}</div>
            )}
            
            {isEditMode && (
              <div className="photo-edit-overlay">
                <label className="upload-btn">
                  📸 Upload (2-5)
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setFilesToUpload(Array.from(e.target.files))}
                  />
                </label>
                {filesToUpload.length > 0 && <span className="file-count">{filesToUpload.length} files</span>}
              </div>
            )}
          </div>

          <div className="basic-identity-card card">
            {isEditMode ? (
              <input 
                className="edit-name-input" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            ) : (
              <h1 className="premium-gradient-text">{profile.name}</h1>
            )}
            
            {isEditMode ? (
              <input 
                className="edit-input"
                type="number"
                value={profile.age || ''} 
                onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 0})}
              />
            ) : (
              <p className="subtitle">{profile.age} Years • {profile.city}, {profile.location || 'India'}</p>
            )}

            <div className={`verification-badge ${profile.isVerified ? 'verified' : ''}`}>
              {profile.isVerified ? '✓ Verified Profile' : '⚠ Pending Verification'}
            </div>

            {!id && !isEditMode && (
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => setIsEditMode(true)}
              >
                Edit Profile
              </button>
            )}
            {!id && isEditMode && (
              <button 
                className="btn btn-primary btn-sm" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={handleSave}
                disabled={isUploading}
              >
                {isUploading ? 'Saving...' : 'Save Changes'}
              </button>
            )}

            {id && (
              <button 
                className="btn btn-text btn-sm" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => navigate('/dashboard')}
              >
                ← Back to Matches
              </button>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT (Right) */}
        <section className="profile-main-content">
          
          {/* About Section */}
          <div className="profile-info-card card">
            <h2>👤 About</h2>
            {isEditMode ? (
              <textarea 
                className="edit-textarea"
                value={profile.about || ''}
                onChange={e => setProfile({...profile, about: e.target.value})}
                placeholder="Hi, I am... I am looking for..."
                rows={4}
              />
            ) : (
              <p>{profile.about || `Hi, I am ${profile.name}. I am looking for a life partner who is understanding and has similar values.`}</p>
            )}
          </div>

          {/* Edu & Job */}
          <div className="profile-info-card card">
            <h2>🎓 Education & Career</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Education</label>
                {isEditMode ? (
                  <input className="edit-input" value={profile.education || ''} onChange={e => setProfile({...profile, education: e.target.value})} />
                ) : <p>{profile.education || 'Not specified'}</p>}
              </div>
              <div className="info-item">
                <label>Profession</label>
                {isEditMode ? (
                  <input className="edit-input" value={profile.job || ''} onChange={e => setProfile({...profile, job: e.target.value})} />
                ) : <p>{profile.job || 'Not specified'}</p>}
              </div>
              <div className="info-item">
                <label>Income</label>
                {isEditMode ? (
                  <select className="edit-input" value={profile.income || ''} onChange={e => setProfile({...profile, income: e.target.value})}>
                    <option value="">Confidential</option>
                    <option value="0-5 LPA">0-5 LPA</option>
                    <option value="5-10 LPA">5-10 LPA</option>
                    <option value="10-20 LPA">10-20 LPA</option>
                    <option value="20+ LPA">20+ LPA</option>
                  </select>
                ) : <p>{profile.income || 'Confidential'}</p>}
              </div>
            </div>
          </div>

          {/* Family Details */}
          <div className="profile-info-card card">
            <h2>👨‍👩‍👧 Family Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Family Type</label>
                {isEditMode ? (
                  <select className="edit-input" value={profile.familyType || ''} onChange={e => setProfile({...profile, familyType: e.target.value})}>
                    <option value="Nuclear">Nuclear</option>
                    <option value="Joint">Joint</option>
                  </select>
                ) : <p>{profile.familyType || 'Nuclear'}</p>}
              </div>
              <div className="info-item">
                <label>Family Values</label>
                {isEditMode ? (
                  <select className="edit-input" value={profile.familyValues || ''} onChange={e => setProfile({...profile, familyValues: e.target.value})}>
                    <option value="Traditional">Traditional</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Liberal">Liberal</option>
                  </select>
                ) : <p>{profile.familyValues || 'Traditional'}</p>}
              </div>
              <div className="info-item">
                <label>Location</label>
                {isEditMode ? (
                  <input className="edit-input" value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} />
                ) : <p>{profile.city}</p>}
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div className="profile-info-card card">
            <h2>✨ Lifestyle</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Diet</label>
                {isEditMode ? (
                  <select className="edit-input" value={profile.diet || ''} onChange={e => setProfile({...profile, diet: e.target.value})}>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                ) : <p>{profile.diet || 'Vegetarian'}</p>}
              </div>
              <div className="info-item">
                <label>Habits</label>
                {isEditMode ? (
                  <select className="edit-input" value={profile.habits || ''} onChange={e => setProfile({...profile, habits: e.target.value})}>
                    <option value="Non-smoker">Non-smoker</option>
                    <option value="Occasional">Occasional</option>
                    <option value="Regular">Regular</option>
                  </select>
                ) : <p>{profile.habits || 'Non-smoker'}</p>}
              </div>
              <div className="info-item">
                <label>Smoking</label>
                {isEditMode ? (
                  <select className="edit-input" value={profile.smoking || ''} onChange={e => setProfile({...profile, smoking: e.target.value})}>
                    <option value="">Not specified</option>
                    <option value="No">No</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Yes">Yes</option>
                  </select>
                ) : <p>{profile.smoking || 'Not specified'}</p>}
              </div>
              <div className="info-item">
                <label>Drinking</label>
                {isEditMode ? (
                  <select className="edit-input" value={profile.drinking || ''} onChange={e => setProfile({...profile, drinking: e.target.value})}>
                    <option value="">Not specified</option>
                    <option value="No">No</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Yes">Yes</option>
                  </select>
                ) : <p>{profile.drinking || 'Not specified'}</p>}
              </div>
            </div>
          </div>

          {/* Bottom Area (Gallery & Actions) */}
          <div className="profile-footer-content">
            <div className="profile-info-card card">
              <h2>📸 Photo Gallery</h2>
              <div className="gallery-scroll">
                {[1, 2, 3].map(i => (
                  <div key={i} className="gallery-item"></div>
                ))}
              </div>
            </div>

            {id && (
              <div className="action-bar">
                <button className="btn btn-secondary" onClick={sendInterest}>Send Interest ❤️</button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleChat}
                  disabled={!profile.isMatched}
                >
                  Chat Now 💬
                </button>
              </div>
            )}
          </div>

        </section>
      </main>

      <style jsx="true">{`
        .loading-state, .error-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80vh;
          font-size: 1.2rem;
          color: var(--text-muted);
        }
        .subtitle {
          color: var(--text-muted);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default Profile;
