const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) return res.status(401).json({ error: 'Invalid admin credentials' });

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid admin credentials' });

    const token = jwt.sign(
      { id: admin.id, role: 'ADMIN', level: admin.level },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({ token, username: admin.username });
  } catch (error) {
    res.status(500).json({ error: 'Admin login failed' });
  }
};

// User Moderation
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status, isVerified } = req.body; // status: ACTIVE, PENDING, BLOCKED
    
    await prisma.user.update({
      where: { id: userId },
      data: { 
        status: status !== undefined ? status : undefined,
        isVerified: isVerified !== undefined ? isVerified : undefined
      }
    });

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({ where: { isVerified: true } });
    const blockedUsers = await prisma.user.count({ where: { status: 'BLOCKED' } });
    const premiumUsers = await prisma.profile.count({ where: { isPremium: true } });

    res.json({
      totalUsers,
      verifiedUsers,
      blockedUsers,
      premiumUsers,
      stats: {
        newToday: 0, // Placeholder
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Cascading delete will handle profile/messages if set up in Prisma
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
