// Vercel serverless function entry point
const path = require('path');

// Ustaw __dirname dla względnych importów
global.__basedir = path.resolve(__dirname, '..');

// Import Express app
const app = require('../app/app');

// Export jako serverless function
module.exports = app;
