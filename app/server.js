const http = require('http');
const app = require('./app');
const initializeDatabase = require('./utils/db-init');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    if (process.env.DATABASE_URL) {
      console.log('🎤 RSG Platform - Initializing database...');
      await initializeDatabase();
    } else {
      console.warn('⚠️  No DATABASE_URL found - skipping database initialization');
    }

    // Start server
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🎤 RSG PLATFORM - Hip-Hop & Underground    ║
║                                               ║
║   Server running on port ${PORT}               ║
║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
║                                               ║
║   🌐 http://localhost:${PORT}                  ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM signal received - closing server gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT signal received - closing server gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = server;
