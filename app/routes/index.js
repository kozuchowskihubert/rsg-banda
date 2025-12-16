const express = require('express');
const router = express.Router();

// Import route modules
const contentRoutes = require('./content');
const beatsRoutes = require('./beats');
const authRoutes = require('./auth');
const healthRoutes = require('./health');

// Mount routes
router.use('/content', contentRoutes);
router.use('/beats', beatsRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

// API root
router.get('/', (req, res) => {
  res.json({
    message: '🎤 RSG Platform API',
    version: '1.0.0',
    endpoints: {
      content: '/api/content',
      beats: '/api/beats',
      auth: '/api/auth',
      health: '/api/health',
    },
  });
});

module.exports = router;
