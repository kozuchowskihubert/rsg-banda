const pool = require('../config/database');

async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('🎤 Initializing RSG Platform database...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        username VARCHAR(100) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        bio TEXT,
        avatar_url TEXT,
        google_id VARCHAR(255) UNIQUE,
        azure_id VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE,
        settings JSONB DEFAULT '{}'::jsonb
      );
    `);

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL PRIMARY KEY,
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    // Create content/posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        content_type VARCHAR(50) DEFAULT 'post',
        tags TEXT[],
        metadata JSONB DEFAULT '{}'::jsonb,
        is_published BOOLEAN DEFAULT FALSE,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_content_user ON content(user_id);
      CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
    `);

    // Create beats/tracks table (hip-hop specific)
    await client.query(`
      CREATE TABLE IF NOT EXISTS beats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        artist_name VARCHAR(255),
        bpm INTEGER,
        key VARCHAR(10),
        genre VARCHAR(100),
        audio_url TEXT,
        cover_image_url TEXT,
        description TEXT,
        tags TEXT[],
        is_free BOOLEAN DEFAULT FALSE,
        price DECIMAL(10, 2),
        downloads INTEGER DEFAULT 0,
        plays INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_beats_user ON beats(user_id);
      CREATE INDEX IF NOT EXISTS idx_beats_genre ON beats(genre);
    `);

    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content_id INTEGER REFERENCES content(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        comment_text TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_id);
      CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
    `);

    // Create API keys table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        key_name VARCHAR(255) NOT NULL,
        api_key VARCHAR(255) UNIQUE NOT NULL,
        permissions TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        last_used TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE
      );
      CREATE INDEX IF NOT EXISTS idx_apikeys_user ON api_keys(user_id);
      CREATE INDEX IF NOT EXISTS idx_apikeys_key ON api_keys(api_key);
    `);

    client.release();
    console.log('✅ RSG Platform database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
