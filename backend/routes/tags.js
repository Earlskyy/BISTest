import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require staff authentication
router.use(authenticate);
router.use(authorize('staff', 'admin'));

// Get all tags
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM resident_tags ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Create tag
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const result = await pool.query(
      'INSERT INTO resident_tags (name, description) VALUES ($1, $2) RETURNING *',
      [name.trim(), description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Tag already exists' });
    }
    next(error);
  }
});

// Assign tag to family member
router.post('/assign', async (req, res, next) => {
  try {
    const { family_member_id, tag_id } = req.body;

    if (!family_member_id || !tag_id) {
      return res.status(400).json({ error: 'family_member_id and tag_id are required' });
    }

    const result = await pool.query(
      'INSERT INTO resident_tag_assignments (family_member_id, tag_id) VALUES ($1, $2) RETURNING *',
      [family_member_id, tag_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Tag already assigned to this member' });
    }
    next(error);
  }
});

// Remove tag from family member
router.delete('/assign/:assignmentId', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM resident_tag_assignments WHERE id = $1 RETURNING id',
      [req.params.assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tag assignment not found' });
    }

    res.json({ message: 'Tag assignment removed successfully' });
  } catch (error) {
    next(error);
  }
});

// Get residents by tag
router.get('/:tagId/residents', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        fm.*,
        h.head_name as household_head,
        h.address as household_address
      FROM family_members fm
      INNER JOIN resident_tag_assignments rta ON fm.id = rta.family_member_id
      INNER JOIN households h ON fm.household_id = h.id
      WHERE rta.tag_id = $1
      ORDER BY fm.full_name
      LIMIT $2 OFFSET $3`,
      [req.params.tagId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM resident_tag_assignments WHERE tag_id = $1',
      [req.params.tagId]
    );

    res.json({
      residents: result.rows,
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

export default router;
