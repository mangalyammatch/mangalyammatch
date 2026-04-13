const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const interestRoutes = require('./routes/interestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Trust proxy for secure cookies/headers on cloud platforms
app.set('trust proxy', 1);

// Production Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for easier initial deployment if needed
}));
app.use(compression());
app.use(cors()); // In final prod, we can restrict this to the frontend domain
app.use(express.json());

// Serve static files from uploads folder (fallback for old images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d' // Cache local images for 1 day
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'MangalyamMatch API is running perfectly' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Stability heartbit: Ensure process stays alive
setInterval(() => {}, 1 << 30); 
