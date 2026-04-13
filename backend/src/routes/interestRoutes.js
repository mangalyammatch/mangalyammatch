const express = require('express');
const router = express.Router();
const { sendInterest, getMyInterests, handleInterest, getMatches } = require('../controllers/interestController');
const auth = require('../middleware/auth');

router.use(auth); // All interest routes require auth

router.post('/send', sendInterest);
router.get('/pending', getMyInterests);
router.post('/handle', handleInterest);
router.get('/matches', getMatches);

module.exports = router;
