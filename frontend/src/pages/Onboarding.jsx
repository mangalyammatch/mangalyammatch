import React, { useState } from 'react';
import API_BASE_URL from '../config';
import './Onboarding.css';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const totalSteps = 9;

  const [formData, setFormData] = useState({
    name: '', dob: '', gender: '', height: '',
    religion: '', community: '', subCommunity: '',
    education: '', job: '', income: '',
    location: '', city: '',
    diet: '', habits: '', smoking: '', drinking: '',
    familyType: '', familyValues: '',
    photos: []
  });
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const countries = [
    'India', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain',
    'United Kingdom', 'United States', 'Canada', 'Australia', 'New Zealand',
    'Singapore', 'Malaysia', 'Germany', 'France', 'Ireland'
  ].sort();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    const token = localStorage.getItem('token');
    
    try {
      let finalData = { ...formData };

      if (filesToUpload.length > 0) {
         if (filesToUpload.length < 2 || filesToUpload.length > 5) {
            alert('Please select between 2 and 5 images.');
            setIsUploading(false);
            return;
         }
         
         const uploadData = new FormData();
         filesToUpload.forEach(file => uploadData.append('photos', file));

         const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${token}` },
           body: uploadData
         });

         if (!uploadRes.ok) throw new Error('Image upload failed');

         const uploadedPhotos = await uploadRes.json();
         finalData.photos = uploadedPhotos.urls.join(',');
      } else {
         alert('Please upload between 2 and 5 photos for verification.');
         setIsUploading(false);
         return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      setIsSubmitted(true);
      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
      alert(err.message || 'Failed to save profile');
    }
  };

  const communitiesData = {
    'Hindu': {
      'Nair': ['Illam', 'Kiriyam', 'Swaroopam'],
      'Ezhava / Thiyya': ['Ezhava', 'Thiyya'],
      'Dheevara': ['Araya', 'Mukkuva', 'Valan'],
      'Brahmin': ['Namboothiri', 'Iyer', 'Iyengar'],
      'Kshatriya': ['Samantan', 'Thampan'],
      'Other': ['User-defined']
    },
    'Muslim': {
      'Sunni': ['Shafi', 'Hanafi'],
      'Mujahid': ['Kerala Nadvathul Mujahideen (KNM)', 'Wisdom group'],
      'Jamaat-e-Islami': ['General'],
      'Other': ['Mappila', 'User-defined'],
      'Prefer not to say': []
    },
    'Christian': {
      'Syrian Christian (Nasrani)': ['Knanaya', 'Jacobite', 'Orthodox'],
      'Latin Catholic': ['General'],
      'Syro-Malabar Catholic': ['General'],
      'Syro-Malankara Catholic': ['General'],
      'Orthodox': ['Malankara Orthodox'],
      'Jacobite': ['Jacobite Syrian'],
      'Marthoma': ['General'],
      'CSI (Church of South India)': ['General'],
      'Pentecostal': ['General Pentecostal', 'Independent churches'],
      'Other': ['User-defined'],
      'Prefer not to say': []
    },
    'Other': {
      'Other': ['User-defined']
    }
  };

  const getAvailableCommunities = () => {
    if (!formData.religion || formData.religion === 'Prefer not to say') return communitiesData['Other'];
    return communitiesData[formData.religion] || communitiesData['Other'];
  };

  const availableCommunities = getAvailableCommunities();

  if (isSubmitted) {
    return (
      <div className="register-container">
        <div className="register-card card" style={{ textAlign: 'center' }}>
          <h2 className="premium-gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉 Welcome!</h2>
          <h3>Profile Created Successfully</h3>
          <p style={{ margin: '2rem 0' }}>Your profile has been created and is under review to verify details. We have sent an email confirmation.</p>
          <a href="/" className="btn btn-primary">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card card">
        <h2 className="premium-gradient-text">Create Your Profile</h2>
        <p className="step-indicator">Step {step} of {totalSteps}</p>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>

        <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          
          {step === 1 && (
            <div className="form-step">
              <h3>1. Basic Information</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 175" required />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3>2. Religion (Optional)</h3>
              <p className="hint">This helps us find more compatible matches, but is strictly optional.</p>
              <div className="form-group">
                <label>Religion</label>
                <select name="religion" value={formData.religion} onChange={handleChange}>
                  <option value="">Prefer not to say</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3>3. Community (Optional)</h3>
              <p className="hint">Options depend on the Religion selected in Step 2.</p>
              <div className="form-group">
                <label>Community</label>
                <select name="community" value={formData.community} onChange={(e) => { handleChange(e); setFormData(prev => ({...prev, subCommunity: ''})) }}>
                  <option value="">Select Community</option>
                  {Object.keys(availableCommunities).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Sub-Community</label>
                {formData.community === 'Other' || formData.community === 'Prefer not to say' ? (
                  <input type="text" name="subCommunity" placeholder="Specify user-defined subgroup" value={formData.subCommunity} onChange={handleChange} />
                ) : (
                  <select name="subCommunity" value={formData.subCommunity} onChange={handleChange} disabled={!formData.community || availableCommunities[formData.community]?.length === 0}>
                    <option value="">Select Sub-Community</option>
                    {formData.community && availableCommunities[formData.community]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-step">
              <h3>4. Education & Profession</h3>
              <div className="form-group">
                <label>Highest Education</label>
                <input type="text" name="education" value={formData.education} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Job Title / Profession</label>
                <input type="text" name="job" value={formData.job} onChange={handleChange} required />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="form-step">
              <h3>5. Location</h3>
              <div className="form-group">
                <label>Country</label>
                <select name="location" value={formData.location} onChange={handleChange} required>
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="form-step">
              <h3>6. Lifestyle (Optional)</h3>
              <div className="form-group">
                <label>Diet</label>
                <select name="diet" value={formData.diet} onChange={handleChange}>
                  <option value="">No Preference</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Smoking Preference</label>
                <select name="smoking" value={formData.smoking} onChange={handleChange}>
                  <option value="">Not Specified</option>
                  <option value="No">No</option>
                  <option value="Occasionally">Occasionally</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Drinking Preference</label>
                <select name="drinking" value={formData.drinking} onChange={handleChange}>
                  <option value="">Not Specified</option>
                  <option value="No">No</option>
                  <option value="Occasionally">Occasionally</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="form-step">
              <h3>7. Family Details (Optional)</h3>
              <div className="form-group">
                <label>Family Type</label>
                <select name="familyType" value={formData.familyType} onChange={handleChange}>
                  <option value="">Prefer not to say</option>
                  <option value="Nuclear">Nuclear</option>
                  <option value="Joint">Joint</option>
                </select>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="form-step">
              <h3>8. Upload Photos</h3>
              <p className="hint">Please select exactly 2 to 5 images.</p>
              <div className="form-group">
                <label className="btn btn-secondary" style={{display: 'inline-block', cursor: 'pointer', textAlign: 'center'}}>
                  Choose Files
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    style={{display: 'none'}} 
                    onChange={(e) => setFilesToUpload(Array.from(e.target.files))}
                  />
                </label>
                <p style={{marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-main)'}}>
                  {filesToUpload.length} files selected
                </p>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="form-step">
              <h3>9. Final Review</h3>
              <p className="hint">You have completed all steps! Your profile is ready to be saved.</p>
            </div>
          )}

          <div className="form-actions">
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                Back
              </button>
            )}
            
            {step < totalSteps ? (
              <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                Continue
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto', backgroundColor: '#d4af37' }} disabled={isUploading}>
                {isUploading ? 'Uploading & Saving...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
