const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { storage } = require('../config/cloudinary');

// Multer configured with Cloudinary
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload endpoint (requires auth)
router.post('/', auth, upload.array('photos', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Cloudinary returns the full absolute URL in 'path' or 'secure_url'
    const fileUrls = req.files.map(file => file.path);

    res.json({
      message: 'Files uploaded successfully to Cloudinary',
      urls: fileUrls
    });
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

module.exports = router;
