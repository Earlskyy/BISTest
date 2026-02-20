import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Get system logs
router.get('/logs', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, user_id, action } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sl.*, u.full_name as user_name, u.email as user_email
      FROM system_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (user_id) {
      query += ` AND sl.user_id = $${paramCount++}`;
      params.push(user_id);
    }

    if (action) {
      query += ` AND sl.action ILIKE $${paramCount++}`;
      params.push(`%${action}%`);
    }

    query += ` ORDER BY sl.timestamp DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM system_logs');

    res.json({
      logs: result.rows,
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

// Get system statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [
      householdsCount,
      familyMembersCount,
      certificateRequestsCount,
      blotterCount,
      complaintsCount,
      announcementsCount,
      usersCount
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM households'),
      pool.query('SELECT COUNT(*) FROM family_members'),
      pool.query('SELECT COUNT(*) FROM certificate_requests'),
      pool.query('SELECT COUNT(*) FROM blotter_records'),
      pool.query('SELECT COUNT(*) FROM complaints'),
      pool.query('SELECT COUNT(*) FROM announcements'),
      pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['staff'])
    ]);

    res.json({
      households: parseInt(householdsCount.rows[0].count),
      family_members: parseInt(familyMembersCount.rows[0].count),
      certificate_requests: parseInt(certificateRequestsCount.rows[0].count),
      blotter_records: parseInt(blotterCount.rows[0].count),
      complaints: parseInt(complaintsCount.rows[0].count),
      announcements: parseInt(announcementsCount.rows[0].count),
      staff_users: parseInt(usersCount.rows[0].count)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
