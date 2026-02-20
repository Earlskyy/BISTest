import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

function generateReferenceNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `BIS-${date}-${random}`;
}

// Public route: Create certificate request (no auth required)
router.post('/request', validate(schemas.createCertificateRequest), async (req, res, next) => {
  try {
    const {
      full_name,
      address,
      certificate_type,
      birth_date,
      age,
      civil_status,
      purpose,
      contact_number,
      photo_url
    } = req.body;

    const reference_number = generateReferenceNumber();

    const result = await pool.query(
      `INSERT INTO certificate_requests 
       (reference_number, full_name, address, certificate_type, birth_date, age, civil_status, purpose, contact_number, photo_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        reference_number,
        full_name,
        address,
        certificate_type,
        birth_date || null,
        age || null,
        civil_status || null,
        purpose || null,
        contact_number || null,
        photo_url || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Staff route: Walk-in applicant (create request manually)
router.post('/walkin', authenticate, authorize('staff', 'admin'), validate(schemas.createCertificateRequest), async (req, res, next) => {
  try {
    const {
      full_name,
      address,
      certificate_type,
      birth_date,
      age,
      civil_status,
      purpose,
      contact_number,
      photo_url,
      profile_photo_url,
      template_id
    } = req.body;

    const reference_number = generateReferenceNumber();

    const result = await pool.query(
      `INSERT INTO certificate_requests
       (reference_number, full_name, address, certificate_type, birth_date, age, civil_status, purpose, contact_number, photo_url, profile_photo_url, template_id, status, processed_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending',$13)
       RETURNING *`,
      [
        reference_number,
        full_name,
        address,
        certificate_type,
        birth_date || null,
        age || null,
        civil_status || null,
        purpose || null,
        contact_number || null,
        photo_url || null,
        profile_photo_url || null,
        template_id || null,
        req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Public route: Lookup certificate status by reference number
router.get('/status/:referenceNumber', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, reference_number, full_name, address, certificate_type, status, created_at, updated_at 
       FROM certificate_requests 
       WHERE UPPER(reference_number) = UPPER($1)`,
      [req.params.referenceNumber.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found. Please check your reference number.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Staff routes: require authentication
router.use(authenticate);
router.use(authorize('staff', 'admin'));

// Get all certificate requests
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT cr.*, u.full_name as processed_by_name 
      FROM certificate_requests cr
      LEFT JOIN users u ON cr.processed_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND cr.status = $${paramCount++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (cr.full_name ILIKE $${paramCount} OR cr.address ILIKE $${paramCount} OR cr.reference_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY cr.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM certificate_requests' + (status || search ? ' WHERE 1=1' : ''),
      []
    );

    let countQuery = 'SELECT COUNT(*) FROM certificate_requests WHERE 1=1';
    const countParams = [];
    let cp = 1;
    if (status) {
      countQuery += ` AND status = $${cp++}`;
      countParams.push(status);
    }
    if (search) {
      countQuery += ` AND (full_name ILIKE $${cp} OR address ILIKE $${cp} OR reference_number ILIKE $${cp})`;
      countParams.push(`%${search}%`);
    }
    const countRes = await pool.query(countQuery, countParams);

    res.json({
      requests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countRes.rows[0].count),
        pages: Math.ceil(parseInt(countRes.rows[0].count) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get certificate request by ID or reference
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let result;
    if (isUuid) {
      result = await pool.query(
        'SELECT cr.*, u.full_name as processed_by_name FROM certificate_requests cr LEFT JOIN users u ON cr.processed_by = u.id WHERE cr.id = $1',
        [id]
      );
    } else {
      result = await pool.query(
        'SELECT cr.*, u.full_name as processed_by_name FROM certificate_requests cr LEFT JOIN users u ON cr.processed_by = u.id WHERE UPPER(cr.reference_number) = UPPER($1)',
        [id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update certificate request (including fields for certificate content)
router.put('/:id', async (req, res, next) => {
  try {
    const {
      full_name,
      address,
      certificate_type,
      birth_date,
      age,
      civil_status,
      purpose,
      contact_number,
      photo_url
    } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    const optionalFields = {
      full_name, address, certificate_type, birth_date, age,
      civil_status, purpose, contact_number, photo_url, profile_photo_url, template_id
    };
    for (const [key, value] of Object.entries(optionalFields)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCount++}`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    const result = await pool.query(
      `UPDATE certificate_requests SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update certificate request status
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status, photo_url } = req.body;

    if (!['pending', 'approved', 'released'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updates = ['status = $1', 'processed_by = $2', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status, req.user.id];
    let paramCount = 3;

    if (photo_url !== undefined) {
      updates.push(`photo_url = $${paramCount++}`);
      params.push(photo_url);
    }

    params.push(req.params.id);

    const result = await pool.query(
      `UPDATE certificate_requests SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
