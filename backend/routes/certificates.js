import express from 'express';
import pool from '../config/database.js';
import crypto from 'crypto';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { verifyCaptcha } from '../middleware/captcha.js';
import { sendSubmissionEmail, sendStatusUpdateEmail } from '../utils/emailService.js';

const router = express.Router();

function generateReferenceNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `BIS-${date}-${random}`;
}

// Predefined reasons for rejection/flagging
const PREDEFINED_REASONS = [
  { id: 'incomplete_requirements', label: 'Incomplete requirements' },
  { id: 'blurry_image', label: 'Blurry image' },
  { id: 'invalid_document', label: 'Invalid document' },
  { id: 'mismatch_information', label: 'Mismatch information' },
  { id: 'missing_attachments', label: 'Missing attachments' },
  { id: 'other', label: 'Other (requires explanation)' }
];

const DOCUMENT_PACKAGES = {
  first_time_job_seeker: {
    name: 'First Time Job Seeker Package',
    documents: [
      'Barangay Clearance',
      'Certificate of Indigency',
      'Affidavit',
      'Checklist Form'
    ]
  }
};

async function resolveTemplateId(certificateType, requestedTemplateId) {
  if (requestedTemplateId) return requestedTemplateId;

  const result = await pool.query(
    `SELECT id
     FROM certificate_templates
     WHERE certificate_type = $1
       AND COALESCE(is_active, true) = true
     ORDER BY COALESCE(is_default, false) DESC, updated_at DESC, created_at DESC
     LIMIT 1`,
    [certificateType]
  );

  return result.rows[0]?.id || null;
}

// Public route: Create certificate request (no auth required)
router.post('/request', verifyCaptcha, validate(schemas.createCertificateRequest), async (req, res, next) => {
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
      purok_cert_url,
      sanitary_card_url,
      reporter_email,
      package_code
    } = req.body;

    const selectedPackage = package_code ? DOCUMENT_PACKAGES[package_code] : null;
    if (package_code && !selectedPackage) {
      return res.status(400).json({ error: 'Invalid document package' });
    }

    const documentTypes = selectedPackage?.documents?.length
      ? selectedPackage.documents
      : [certificate_type];
    const packageGroupId = selectedPackage ? crypto.randomUUID() : null;
    const insertedRequests = [];

    for (const documentType of documentTypes) {
      const reference_number = generateReferenceNumber();
      const templateId = await resolveTemplateId(documentType, null);

      const result = await pool.query(
        `INSERT INTO certificate_requests
         (reference_number, full_name, address, certificate_type, birth_date, age, civil_status, purpose, contact_number, photo_url, purok_cert_url, sanitary_card_url, reporter_email, template_id, package_group_id, package_name, package_item_name, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'pending')
         RETURNING *`,
        [
          reference_number,
          full_name,
          address,
          documentType,
          birth_date || null,
          age || null,
          civil_status || null,
          purpose || null,
          contact_number || null,
          photo_url || null,
          purok_cert_url,
          sanitary_card_url,
          reporter_email || null,
          templateId,
          packageGroupId,
          selectedPackage?.name || null,
          selectedPackage ? documentType : null
        ]
      );
      insertedRequests.push(result.rows[0]);
    }

    // Send submission email
    if (reporter_email) {
      await sendSubmissionEmail(reporter_email, insertedRequests[0].reference_number, 'document', {
        full_name,
        certificate_type: selectedPackage?.name || certificate_type
      });
      
      // Mark email as sent
      await pool.query(
        'UPDATE certificate_requests SET email_sent = true WHERE package_group_id = $1 OR id = $2',
        [packageGroupId, insertedRequests[0].id]
      );
    }

    if (insertedRequests.length === 1) {
      return res.status(201).json(insertedRequests[0]);
    }

    res.status(201).json({
      package_group_id: packageGroupId,
      package_name: selectedPackage?.name,
      reference_number: insertedRequests[0].reference_number,
      requests: insertedRequests
    });
  } catch (error) {
    next(error);
  }
});

// Staff route: Walk-in applicant (create request manually)
router.post('/walkin', authenticate, authorize('staff', 'admin'), validate(schemas.createWalkInCertificateRequest), async (req, res, next) => {
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
      template_id,
      purok_cert_url,
      sanitary_card_url,
      reporter_email,
      package_code
    } = req.body;

    const selectedPackage = package_code ? DOCUMENT_PACKAGES[package_code] : null;
    if (package_code && !selectedPackage) {
      return res.status(400).json({ error: 'Invalid document package' });
    }

    const documentTypes = selectedPackage?.documents?.length
      ? selectedPackage.documents
      : [certificate_type];
    const packageGroupId = selectedPackage ? crypto.randomUUID() : null;
    const insertedRequests = [];

    for (const documentType of documentTypes) {
      const reference_number = generateReferenceNumber();
      const assignedTemplateId = await resolveTemplateId(documentType, template_id || null);
      const result = await pool.query(
        `INSERT INTO certificate_requests
         (reference_number, full_name, address, certificate_type, birth_date, age, civil_status, purpose, contact_number, photo_url, profile_photo_url, template_id, purok_cert_url, sanitary_card_url, reporter_email, package_group_id, package_name, package_item_name, status, processed_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'pending',$19)
         RETURNING *`,
        [
          reference_number,
          full_name,
          address,
          documentType,
          birth_date || null,
          age || null,
          civil_status || null,
          purpose || null,
          contact_number || null,
          photo_url || null,
          profile_photo_url || null,
          assignedTemplateId,
          purok_cert_url || null,
          sanitary_card_url || null,
          reporter_email || null,
          packageGroupId,
          selectedPackage?.name || null,
          selectedPackage ? documentType : null,
          req.user.id
        ]
      );
      insertedRequests.push(result.rows[0]);
    }

    // Send submission email for walk-in
    if (reporter_email) {
      await sendSubmissionEmail(reporter_email, insertedRequests[0].reference_number, 'document', {
        full_name,
        certificate_type: selectedPackage?.name || certificate_type
      });
      
      await pool.query(
        'UPDATE certificate_requests SET email_sent = true WHERE package_group_id = $1 OR id = $2',
        [packageGroupId, insertedRequests[0].id]
      );
    }

    if (insertedRequests.length === 1) {
      return res.status(201).json(insertedRequests[0]);
    }

    res.status(201).json({
      package_group_id: packageGroupId,
      package_name: selectedPackage?.name,
      reference_number: insertedRequests[0].reference_number,
      requests: insertedRequests
    });
  } catch (error) {
    next(error);
  }
});

// Public route: Lookup certificate status by reference number
router.get('/status/:referenceNumber', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, reference_number, full_name, address, certificate_type, status, rejection_reason, flagged_reason, created_at, updated_at 
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

// Get predefined rejection/flag reasons
router.get('/predefined-reasons', (req, res) => {
  res.json({ reasons: PREDEFINED_REASONS });
});

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
      photo_url,
      profile_photo_url,
      template_id
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

// Approve certificate request
router.put('/:id/approve', authenticate, authorize('staff', 'admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE certificate_requests 
       SET status = 'approved', processed_by = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }

    const request = result.rows[0];

    // Send approval email
    if (request.reporter_email) {
      await sendStatusUpdateEmail(
        request.reporter_email,
        request.reference_number,
        'approved',
        '',
        'document',
        { full_name: request.full_name }
      );

      await pool.query(
        'UPDATE certificate_requests SET email_sent = true WHERE id = $1',
        [request.id]
      );
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
});

// Reject certificate request
router.put('/:id/reject', authenticate, authorize('staff', 'admin'), async (req, res, next) => {
  try {
    const { reason_predefined, reason_custom } = req.body;

    if (!reason_predefined && !reason_custom) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const reason = reason_custom || reason_predefined;

    const result = await pool.query(
      `UPDATE certificate_requests 
       SET status = 'rejected', rejection_reason = $1, processed_by = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [reason, req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }

    const request = result.rows[0];

    // Send rejection email
    if (request.reporter_email) {
      await sendStatusUpdateEmail(
        request.reporter_email,
        request.reference_number,
        'rejected',
        reason,
        'document',
        { full_name: request.full_name }
      );

      await pool.query(
        'UPDATE certificate_requests SET email_sent = true WHERE id = $1',
        [request.id]
      );
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
});

// Flag certificate request for review
router.put('/:id/flag', authenticate, authorize('staff', 'admin'), async (req, res, next) => {
  try {
    const { reason_predefined, reason_custom } = req.body;

    if (!reason_predefined && !reason_custom) {
      return res.status(400).json({ error: 'Flag reason is required' });
    }

    const reason = reason_custom || reason_predefined;

    const result = await pool.query(
      `UPDATE certificate_requests 
       SET status = 'flagged', flagged_reason = $1, processed_by = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [reason, req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }

    const request = result.rows[0];

    // Send flagged email
    if (request.reporter_email) {
      await sendStatusUpdateEmail(
        request.reporter_email,
        request.reference_number,
        'flagged',
        reason,
        'document',
        { full_name: request.full_name }
      );

      await pool.query(
        'UPDATE certificate_requests SET email_sent = true WHERE id = $1',
        [request.id]
      );
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
});

// Release certificate request
router.put('/:id/release', authenticate, authorize('staff', 'admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE certificate_requests 
       SET status = 'released', processed_by = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }

    const request = result.rows[0];

    // Send release email
    if (request.reporter_email) {
      await sendStatusUpdateEmail(
        request.reporter_email,
        request.reference_number,
        'released',
        '',
        'document',
        { full_name: request.full_name }
      );

      await pool.query(
        'UPDATE certificate_requests SET email_sent = true WHERE id = $1',
        [request.id]
      );
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
});

export default router;
