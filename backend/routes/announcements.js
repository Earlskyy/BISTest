import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Public route: Get all announcements
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT a.*, u.full_name as posted_by_name 
       FROM announcements a
       LEFT JOIN users u ON a.posted_by = u.id
       ORDER BY a.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM announcements');

    res.json({
      announcements: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Public route: Get announcement by ID
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.full_name as posted_by_name 
       FROM announcements a
       LEFT JOIN users u ON a.posted_by = u.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Staff routes: require authentication
router.use(authenticate);
router.use(authorize('staff', 'admin'));

// Create announcement
router.post('/', validate(schemas.createAnnouncement), async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const result = await pool.query(
      'INSERT INTO announcements (title, content, posted_by) VALUES ($1, $2, $3) RETURNING *',
      [title, content, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update announcement
router.put('/:id', async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (title) {
      updates.push(`title = $${paramCount++}`);
      params.push(title);
    }

    if (content) {
      updates.push(`content = $${paramCount++}`);
      params.push(content);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    const result = await pool.query(
      `UPDATE announcements SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete announcement
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
