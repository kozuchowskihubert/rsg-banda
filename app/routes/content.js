const express = require('express');
const router = express.Router();

// Get all content
router.get('/', async (req, res) => {
  try {
    const { type, user_id, limit = 50, offset = 0 } = req.query;
    const pool = req.app.locals.db;

    let query = 'SELECT * FROM content WHERE is_published = TRUE';
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND content_type = $${paramCount}`;
      params.push(type);
    }

    if (user_id) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(user_id);
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
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content',
    });
  }
});

// Get single content by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;

    // Increment view count
    await pool.query(
      'UPDATE content SET views = views + 1 WHERE id = $1',
      [id]
    );

    const result = await pool.query(
      'SELECT * FROM content WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content',
    });
  }
});

// Create new content
router.post('/', async (req, res) => {
  try {
    const { user_id, title, content, content_type = 'post', tags = [], metadata = {} } = req.body;
    const pool = req.app.locals.db;

    if (!user_id || !title) {
      return res.status(400).json({
        success: false,
        error: 'user_id and title are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO content (user_id, title, content, content_type, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, title, content, content_type, tags, JSON.stringify(metadata)]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create content',
    });
  }
});

// Update content
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, is_published } = req.body;
    const pool = req.app.locals.db;

    const result = await pool.query(
      `UPDATE content 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           tags = COALESCE($3, tags),
           is_published = COALESCE($4, is_published),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, content, tags, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update content',
    });
  }
});

// Delete content
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;

    const result = await pool.query(
      'DELETE FROM content WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete content',
    });
  }
});

// Like content
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;

    const result = await pool.query(
      'UPDATE content SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    res.json({
      success: true,
      likes: result.rows[0].likes,
    });
  } catch (error) {
    console.error('Error liking content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like content',
    });
  }
});

module.exports = router;
