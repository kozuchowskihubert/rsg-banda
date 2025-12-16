const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  const pool = req.app.locals.db;
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    const result = await pool.query('SELECT NOW()');
    health.database = {
      status: 'connected',
      timestamp: result.rows[0].now,
    };
  } catch (error) {
    health.database = {
      status: 'disconnected',
      error: error.message,
    };
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
