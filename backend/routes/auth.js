import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Login
router.post('/login', validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account disabled' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', authenticate, async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
