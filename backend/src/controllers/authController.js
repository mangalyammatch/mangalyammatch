const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendOTPEmail } = require('../utils/mailer');

const prisma = new PrismaClient();

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, profileData } = req.body;
    console.log(`[AUTH] Registration attempt for: ${email}`);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    console.log('[AUTH] Hashing password...');
    const password_hash = await bcrypt.hash(password, 10);

    // Step 1: Create user
    console.log('[AUTH] Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        role: 'USER',
        status: 'PENDING',
        isVerified: false,
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      }
    });
    console.log(`[AUTH] User created: ${user.id}`);

    // Step 2: Create profile (sequential, no transaction needed)
    try {
      console.log('[AUTH] Creating profile...');
      await prisma.profile.create({
        data: {
          userId: user.id,
          name: profileData?.name || email.split('@')[0],
          age: parseInt(profileData?.age) || 18,
          gender: profileData?.gender || 'Unknown',
        }
      });
      console.log('[AUTH] Profile created successfully.');
    } catch (profileErr) {
      // Clean up the user if profile creation fails
      console.error('[AUTH] Profile creation failed, cleaning up user:', profileErr.message);
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      throw profileErr;
    }

    // Step 3: Send email (non-blocking if it fails)
    console.log(`[AUTH] Sending OTP to ${email}...`);
    try {
      const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      await sendOTPEmail(user.email, user.otp, profile?.name || 'User');
      console.log('[AUTH] OTP Email sent successfully.');
    } catch (emailErr) {
      console.error('[AUTH] Email send failed (non-critical):', emailErr.message);
    }

    const token = generateToken(user.id, user.role);
    res.status(201).json({ 
      message: 'Registration successful. Please verify your email.',
      token,
      isVerified: false
    });

  } catch (error) {
    console.error('CRITICAL: Registration Error:', {
      message: error.message,
      code: error.code,
    });
    res.status(500).json({ error: 'Internal server error during registration. Please check server logs.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({ 
      message: 'Login successful', 
      token, 
      role: user.role, 
      isVerified: user.isVerified,
      status: user.status
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        status: 'ACTIVE',
        otp: null,
        otpExpires: null
      }
    });

    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpires }
    });

    console.log(`[AUTH] Resent OTP for ${email}: ${otp}`);
    await sendOTPEmail(email, otp, existingUser.profile?.name || 'User');
    
    res.json({ message: 'OTP resent successfully! Please check your inbox.' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};
