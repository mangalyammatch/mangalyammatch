const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
