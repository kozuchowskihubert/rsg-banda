const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL is not set - database features will be disabled');
  module.exports = {
    connect: async () => {
      throw new Error('Database not configured');
    },
    query: async () => {
      throw new Error('Database not configured');
    },
    end: async () => {},
    on: () => {},
  };
} else {
  const isLocalDev = process.env.NODE_ENV === 'development' || 
                     process.env.DATABASE_SSL === 'false' ||
                     databaseUrl.includes('localhost') ||
                     databaseUrl.includes('127.0.0.1');
  
  const sslConfig = isLocalDev ? false : { rejectUnauthorized: false };

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslConfig,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20,
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
  });

  pool.on('connect', () => {
    console.log('✅ New database connection established');
  });

  module.exports = pool;
}
