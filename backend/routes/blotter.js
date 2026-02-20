import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require staff authentication
router.use(authenticate);
router.use(authorize('staff', 'admin'));

// Get all blotter records
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, u.full_name as created_by_name 
      FROM blotter_records b
      LEFT JOIN users u ON b.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (b.complainant_name ILIKE $${paramCount} OR b.respondent_name ILIKE $${paramCount} OR b.incident_details ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      search 
        ? 'SELECT COUNT(*) FROM blotter_records WHERE complainant_name ILIKE $1 OR respondent_name ILIKE $1 OR incident_details ILIKE $1'
        : 'SELECT COUNT(*) FROM blotter_records',
      search ? [`%${search}%`] : []
    );

    res.json({
      records: result.rows,
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

// Get blotter record by ID
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT b.*, u.full_name as created_by_name FROM blotter_records b LEFT JOIN users u ON b.created_by = u.id WHERE b.id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blotter record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Create blotter record
router.post('/', validate(schemas.createBlotter), async (req, res, next) => {
  try {
    const { complainant_name, respondent_name, incident_details, status } = req.body;

    const result = await pool.query(
      'INSERT INTO blotter_records (complainant_name, respondent_name, incident_details, status, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [complainant_name, respondent_name, incident_details, status || 'open', req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update blotter record
router.put('/:id', async (req, res, next) => {
  try {
    const { complainant_name, respondent_name, incident_details, status } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (complainant_name) {
      updates.push(`complainant_name = $${paramCount++}`);
      params.push(complainant_name);
    }

    if (respondent_name !== undefined) {
      updates.push(`respondent_name = $${paramCount++}`);
      params.push(respondent_name);
    }

    if (incident_details) {
      updates.push(`incident_details = $${paramCount++}`);
      params.push(incident_details);
    }

    if (status) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    const result = await pool.query(
      `UPDATE blotter_records SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blotter record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete blotter record
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM blotter_records WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blotter record not found' });
    }

    res.json({ message: 'Blotter record deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
