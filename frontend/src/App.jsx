import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import VerifyOTP from './pages/VerifyOTP';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Pricing from './pages/Pricing';
import PublicSearch from './pages/PublicSearch';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import BottomNav from './components/BottomNav';
import API_BASE_URL from './config';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireVerified = true }) => {
  const token = localStorage.getItem('token');
  const isVerified = localStorage.getItem('isVerified') === 'true';

  if (!token) return <Navigate to="/login" replace />;
  
  // If user is logged in but not verified, force them to verify OTP
  if (requireVerified && !isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  return children;
};

// Auth Screen Guard (Prevent logged in users from seeing Login/Signup)
const AuthGuard = ({ children }) => {
  const token = localStorage.getItem('token');
  const isVerified = localStorage.getItem('isVerified') === 'true';

  if (token && isVerified) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) {
            // Token invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('isVerified');
          } else {
            const data = await res.json();
            localStorage.setItem('isVerified', data.profile.isVerified ? 'true' : 'false');
          }
        } catch (err) {
          console.error('Session verify failed:', err);
        }
      }
      setIsInitializing(false);
    };
    checkAuth();
  }, []);

  if (isInitializing) return <div className="loading-screen">Starting MangalyamMatch...</div>;

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Routes (Guarded) */}
          <Route path="/signup" element={<AuthGuard><Signup /></AuthGuard>} />
          <Route path="/login" element={<AuthGuard><Login /></AuthGuard>} />
          
          {/* Verification Route */}
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/search" element={<PublicSearch />} />
          
          {/* Protected Routes */}
          <Route 
            path="/onboarding" 
            element={<ProtectedRoute><Onboarding /></ProtectedRoute>} 
          />
          <Route 
            path="/profile/:id?" 
            element={<ProtectedRoute><Profile /></ProtectedRoute>} 
          />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/chat/:matchId" 
            element={<ProtectedRoute><Chat /></ProtectedRoute>} 
          />
          <Route 
            path="/admin" 
            element={<AdminDashboard />} 
          />
          <Route 
            path="/admin/login" 
            element={<AdminLogin />} 
          />
          <Route 
            path="/pricing" 
            element={<ProtectedRoute><Pricing /></ProtectedRoute>} 
          />
          <Route 
            path="/matches" 
            element={<ProtectedRoute><Matches /></ProtectedRoute>} 
          />
          <Route 
            path="/messages" 
            element={<ProtectedRoute><Messages /></ProtectedRoute>} 
          />
          <Route 
            path="/browse" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
