const express = require('express');
const router = express.Router();
const { getMe, getMatches, saveProfile, publicSearch, getProfileById } = require('../controllers/userController.js');
const auth = require('../middleware/auth.js');

// Public route
router.get('/public/search', publicSearch);

// Protected routes
router.get('/me', auth, getMe);
router.get('/profile/:userId', auth, getProfileById);
router.get('/matches', auth, getMatches);
router.post('/profile', auth, saveProfile);

module.exports = router;
