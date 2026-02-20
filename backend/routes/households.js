import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require staff authentication
router.use(authenticate);
router.use(authorize('staff', 'admin'));

// Get all households with pagination and search
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT h.*, u.full_name as created_by_name 
      FROM households h
      LEFT JOIN users u ON h.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (h.head_name ILIKE $${paramCount} OR h.address ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY h.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      search 
        ? 'SELECT COUNT(*) FROM households WHERE head_name ILIKE $1 OR address ILIKE $1'
        : 'SELECT COUNT(*) FROM households',
      search ? [`%${search}%`] : []
    );

    res.json({
      households: result.rows,
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

// Get household by ID with family members
router.get('/:id', async (req, res, next) => {
  try {
    const householdResult = await pool.query(
      'SELECT h.*, u.full_name as created_by_name FROM households h LEFT JOIN users u ON h.created_by = u.id WHERE h.id = $1',
      [req.params.id]
    );

    if (householdResult.rows.length === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    const membersResult = await pool.query(
      `SELECT fm.*, 
        COALESCE(
          json_agg(
            json_build_object('id', rt.id, 'name', rt.name)
          ) FILTER (WHERE rt.id IS NOT NULL),
          '[]'
        ) as tags
      FROM family_members fm
      LEFT JOIN resident_tag_assignments rta ON fm.id = rta.family_member_id
      LEFT JOIN resident_tags rt ON rta.tag_id = rt.id
      WHERE fm.household_id = $1
      GROUP BY fm.id
      ORDER BY fm.created_at`,
      [req.params.id]
    );

    res.json({
      ...householdResult.rows[0],
      family_members: membersResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create household
router.post('/', validate(schemas.createHousehold), async (req, res, next) => {
  try {
    const { head_name, address, contact_number, civil_status } = req.body;

    const result = await pool.query(
      'INSERT INTO households (head_name, address, contact_number, civil_status, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [head_name, address, contact_number, civil_status, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update household
router.put('/:id', validate(schemas.createHousehold), async (req, res, next) => {
  try {
    const { head_name, address, contact_number, civil_status } = req.body;

    const result = await pool.query(
      'UPDATE households SET head_name = $1, address = $2, contact_number = $3, civil_status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [head_name, address, contact_number, civil_status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete household
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM households WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    res.json({ message: 'Household deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Add family member
router.post('/:id/members', validate(schemas.createFamilyMember), async (req, res, next) => {
  try {
    const { full_name, age, gender, relationship } = req.body;

    const result = await pool.query(
      'INSERT INTO family_members (household_id, full_name, age, gender, relationship) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.id, full_name, age, gender, relationship]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update family member
router.put('/members/:memberId', async (req, res, next) => {
  try {
    const { full_name, age, gender, relationship } = req.body;

    const result = await pool.query(
      'UPDATE family_members SET full_name = $1, age = $2, gender = $3, relationship = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [full_name, age, gender, relationship, req.params.memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete family member
router.delete('/members/:memberId', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM family_members WHERE id = $1 RETURNING id', [req.params.memberId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.json({ message: 'Family member deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
