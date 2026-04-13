const express = require('express');
const router = express.Router();
const { adminLogin, getAllUsers, updateUserStatus, getAnalytics, deleteUser } = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Public Admin Auth
router.post('/login', adminLogin);

// Protected Admin Routes
// In a real app, we'd add 'isAdmin' middleware here
router.get('/users', auth, getAllUsers);
router.post('/user-status', auth, updateUserStatus);
router.get('/analytics', auth, getAnalytics);
router.delete('/user/:userId', auth, deleteUser);

module.exports = router;
