const express = require('express');
const router = express.Router();

// Get all beats
router.get('/', async (req, res) => {
  try {
    const { genre, user_id, is_free, limit = 50, offset = 0 } = req.query;
    const pool = req.app.locals.db;

    let query = 'SELECT * FROM beats WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (genre) {
      paramCount++;
      query += ` AND genre = $${paramCount}`;
      params.push(genre);
    }

    if (user_id) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (is_free !== undefined) {
      paramCount++;
      query += ` AND is_free = $${paramCount}`;
      params.push(is_free === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching beats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch beats',
    });
  }
});

// Get single beat by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;

    const result = await pool.query(
      'SELECT * FROM beats WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Beat not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching beat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch beat',
    });
  }
});

// Create new beat
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      title,
      artist_name,
      bpm,
      key,
      genre,
      audio_url,
      cover_image_url,
      description,
      tags = [],
      is_free = false,
      price = 0,
    } = req.body;
    const pool = req.app.locals.db;

    if (!user_id || !title) {
      return res.status(400).json({
        success: false,
        error: 'user_id and title are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO beats (user_id, title, artist_name, bpm, key, genre, audio_url, 
                         cover_image_url, description, tags, is_free, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [user_id, title, artist_name, bpm, key, genre, audio_url, cover_image_url, 
       description, tags, is_free, price]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating beat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create beat',
    });
  }
});

// Increment play count
router.post('/:id/play', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;

    const result = await pool.query(
      'UPDATE beats SET plays = plays + 1 WHERE id = $1 RETURNING plays',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Beat not found',
      });
    }

    res.json({
      success: true,
      plays: result.rows[0].plays,
    });
  } catch (error) {
    console.error('Error updating play count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update play count',
    });
  }
});

// Like beat
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;

    const result = await pool.query(
      'UPDATE beats SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Beat not found',
      });
    }

    res.json({
      success: true,
      likes: result.rows[0].likes,
    });
  } catch (error) {
    console.error('Error liking beat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like beat',
    });
  }
});

// Delete beat
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;

    const result = await pool.query(
      'DELETE FROM beats WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Beat not found',
      });
    }

    res.json({
      success: true,
      message: 'Beat deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting beat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete beat',
    });
  }
});

module.exports = router;
