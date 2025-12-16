const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');
const apiRoutes = require('./routes/index');

const app = express();

// ============================================================================
// Security Middleware
// ============================================================================

app.use(helmet({
  contentSecurityPolicy: false, // Wyłączone dla testów
}));

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.APP_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ============================================================================
// Body Parsing
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// Session Management
// ============================================================================

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'rsg-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

// Use PostgreSQL for session storage in production
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  sessionConfig.store = new pgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  });
}

app.use(session(sessionConfig));

// ============================================================================
// Database Connection
// ============================================================================

app.locals.db = pool;

// ============================================================================
// Static Files
// ============================================================================

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Log when static file is served
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.url.includes('/images/')) {
      console.log(`🖼️  Image request: ${req.url} - Status: ${res.statusCode}`);
    }
  });
  next();
});

// ============================================================================
// API Routes
// ============================================================================

app.use('/api', apiRoutes);

// ============================================================================
// Health Check
// ============================================================================

app.get('/health', async (req, res) => {
  const response = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    app: 'RSG Platform',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  try {
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
    ]);

    if (client) {
      try {
        await client.query('SELECT 1');
        response.database = 'connected';
      } catch (dbErr) {
        response.database = 'error';
        response.db_error = dbErr.message;
      } finally {
        client.release();
      }
    }
  } catch (err) {
    response.database = 'unavailable';
  }

  const statusCode = response.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(response);
});

// ============================================================================
// SPA Fallback
// ============================================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// Error Handling
// ============================================================================

app.use((err, req, res, next) => {
  console.error('💥 Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

module.exports = app;
