import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin only)
router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, full_name, email, role, status, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount++}`;
      params.push(role);
    }

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM users');

    res.json({
      users: result.rows,
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

// Get user by ID (admin only)
router.get('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, status, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Create user (admin only)
router.post('/', authorize('admin'), validate(schemas.createUser), async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Check if email exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role, status, created_at',
      [full_name, email, password_hash, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.put('/:id', authorize('admin'), validate(schemas.updateUser), async (req, res, next) => {
  try {
    const { full_name, email, role, status } = req.body;
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (full_name) {
      updates.push(`full_name = $${paramCount++}`);
      params.push(full_name);
    }

    if (email) {
      // Check if email exists for another user
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.params.id]
      );
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      updates.push(`email = $${paramCount++}`);
      params.push(email);
    }

    if (role) {
      updates.push(`role = $${paramCount++}`);
      params.push(role);
    }

    if (status) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.params.id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, full_name, email, role, status, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Reset password (admin only)
router.post('/:id/reset-password', authorize('admin'), async (req, res, next) => {
  try {
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [password_hash, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    // Prevent deleting own account
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
