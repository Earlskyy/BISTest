import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Public route: Create complaint (no auth required)
router.post('/', validate(schemas.createComplaint), async (req, res, next) => {
  try {
    const { reporter_name, reporter_photo_url, incident_photo_url, reported_person, complaint_details } = req.body;

    const result = await pool.query(
      'INSERT INTO complaints (reporter_name, reporter_photo_url, incident_photo_url, reported_person, complaint_details) VALUES ($1, $2, $3, $4, $5) RETURNING id, status, created_at',
      [reporter_name, reporter_photo_url, incident_photo_url, reported_person, complaint_details]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Staff routes: require authentication
router.use(authenticate);
router.use(authorize('staff', 'admin'));

// Get all complaints (reporter_name hidden for privacy)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.id,
        '***' as reporter_name,
        c.reporter_photo_url,
        c.incident_photo_url,
        c.reported_person,
        c.complaint_details,
        c.status,
        c.created_at,
        c.updated_at,
        u.full_name as reviewed_by_name
      FROM complaints c
      LEFT JOIN users u ON c.reviewed_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND c.status = $${paramCount++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (c.reported_person ILIKE $${paramCount} OR c.complaint_details ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM complaints' + (status || search ? ' WHERE 1=1' : ''),
      []
    );

    res.json({
      complaints: result.rows,
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

// Get complaint by ID (with full details for staff)
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.full_name as reviewed_by_name 
       FROM complaints c 
       LEFT JOIN users u ON c.reviewed_by = u.id 
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update complaint status
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'validated', 'resolved', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE complaints SET status = $1, reviewed_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
