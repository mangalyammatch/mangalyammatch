const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations } = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.get('/:matchId', getMessages);

module.exports = router;
