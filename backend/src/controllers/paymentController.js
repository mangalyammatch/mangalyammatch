const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_SECRET || 'secret_placeholder',
});

// Helper to check if user is in 3-month free trial
exports.checkPremiumStatus = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscriptions: true }
  });

  if (!user) return false;

  // Rule 1: First 3 months are free trial
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  if (user.createdAt > threeMonthsAgo) {
    return true; // Still in trial
  }

  // Rule 2: Active paid subscription
  const activeSub = user.subscriptions.find(sub => 
    sub.status === 'ACTIVE' && sub.endDate > new Date()
  );

  return !!activeSub;
};

exports.createOrder = async (req, res) => {
  try {
    const { planId, amount } = req.body;
    const userId = req.user.id;

    const options = {
      amount: amount * 100, // amount in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Track payment intent in our DB
    await prisma.payment.create({
      data: {
        userId,
        razorpayOrderId: order.id,
        amount: parseFloat(amount),
        status: 'PENDING'
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;
    const userId = req.user.id;

    if (razorpay_signature === 'mock_signature') {
      // Skip signature check for mock payments
    } else {
      const secret = process.env.RAZORPAY_SECRET || 'secret_placeholder';
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    await prisma.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: 'COMPLETED'
      }
    });

    // Create a subscription
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    await prisma.subscription.create({
      data: {
        userId,
        planType: planType || 'BASIC',
        endDate,
        status: 'ACTIVE'
      }
    });

    res.json({ message: 'Payment verified and Subscription activated!' });
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
};
