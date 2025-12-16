const express = require('express');
const router = express.Router();

// Import route modules
const contentRoutes = require('./content');
const beatsRoutes = require('./beats');
const authRoutes = require('./auth');
const healthRoutes = require('./health');
const productsRoutes = require('./products');
const cartRoutes = require('./cart');

// Mount routes
router.use('/content', contentRoutes);
router.use('/beats', beatsRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);

// API root
router.get('/', (req, res) => {
  res.json({
    message: '🎤 RSG BANDA API',
    version: '2.0.0',
    endpoints: {
      products: '/api/products',
      cart: '/api/cart',
      content: '/api/content',
      beats: '/api/beats',
      auth: '/api/auth',
      health: '/api/health',
    },
  });
});

module.exports = router;
