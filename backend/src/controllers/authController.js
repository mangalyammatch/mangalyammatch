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
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create User and Profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password_hash,
          role: 'USER',
          status: 'PENDING',
          isVerified: false,
          otp: Math.floor(100000 + Math.random() * 900000).toString(),
          otpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        }
      });
      
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          name: profileData.name || 'Anonymous',
          age: parseInt(profileData.age) || 18,
          gender: profileData.gender || 'Unknown',
          // ... other fields kept as optional
        }
      });
      
      return user;
    });

    console.log(`[AUTH] OTP for ${newUser.email}: ${newUser.otp}`);
    
    // Send Real Email
    const profile = await prisma.profile.findUnique({ where: { userId: newUser.id } });
    await sendOTPEmail(newUser.email, newUser.otp, profile.name || 'User');

    const token = generateToken(newUser.id, newUser.role);
    res.status(201).json({ 
      message: 'Registration successful. Please verify your email.',
      token,
      isVerified: false
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
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
