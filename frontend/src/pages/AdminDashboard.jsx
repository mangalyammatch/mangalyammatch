import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [usersRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/admin/analytics', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const usersData = await usersRes.json();
        const statsData = await statsRes.json();

        if (usersRes.status === 401 || usersRes.status === 403) {
          window.location.href = '/admin/login';
          return;
        }

        setUsers(usersData);
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleStatusUpdate = async (userId, status, isVerified) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/admin/user-status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, status, isVerified })
      });
      // Refresh list
      setUsers(users.map(u => u.id === userId ? { ...u, status: status ?? u.status, isVerified: isVerified ?? u.isVerified } : u));
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/user/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  if (loading) return <div className="admin-loading">Accessing Secure Admin Panel...</div>;

  return (
    <div className="admin-page">
      <Navbar user={{ name: 'Platform Admin' }} />
      
      <main className="admin-content">
        <header className="admin-header">
          <h1 className="premium-gradient-text">Admin Command Center</h1>
          <p>Global platform moderation and analytics</p>
        </header>

        {/* Analytics Section */}
        {stats && (
          <div className="admin-stats-grid">
            <div className="stat-card card">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.totalUsers}</span>
            </div>
            <div className="stat-card card">
              <span className="stat-label">Verified</span>
              <span className="stat-value">{stats.verifiedUsers}</span>
            </div>
            <div className="stat-card card">
              <span className="stat-label">Premium</span>
              <span className="stat-value">{stats.premiumUsers}</span>
            </div>
            <div className="stat-card card">
              <span className="stat-label">Blocked</span>
              <span className="stat-value" style={{ color: '#d32f2f' }}>{stats.blockedUsers}</span>
            </div>
          </div>
        )}

        {/* User Management Table */}
        <section className="admin-users-section card">
          <div className="section-header">
            <h2>User Management</h2>
            <div className="search-box">
              <input type="text" placeholder="Search by name or email..." />
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info-cell">
                        <strong>{user.profile?.name || 'No Profile'}</strong>
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      {user.isVerified ? (
                        <span className="verified-check">✓ Yes</span>
                      ) : (
                        <button className="btn-verify" onClick={() => handleStatusUpdate(user.id, undefined, true)}>Verify Now</button>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="row-actions">
                        {user.status !== 'BLOCKED' ? (
                          <button className="btn-block" onClick={() => handleStatusUpdate(user.id, 'BLOCKED')}>Block</button>
                        ) : (
                          <button className="btn-activate" onClick={() => handleStatusUpdate(user.id, 'ACTIVE')}>Activate</button>
                        )}
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
