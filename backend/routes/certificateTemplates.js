import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('staff', 'admin'));

// List templates (optional filter by certificate_type)
router.get('/', async (req, res, next) => {
  try {
    const { certificate_type, include_inactive } = req.query;
    const params = [];
    let sql = `
      SELECT ct.*, u.full_name AS created_by_name
      FROM certificate_templates ct
      LEFT JOIN users u ON ct.created_by = u.id
      WHERE 1=1
    `;
    if (include_inactive !== 'true') {
      sql += ` AND COALESCE(ct.is_active, true) = true`;
    }
    if (certificate_type) {
      sql += ` AND ct.certificate_type = $${params.length + 1}`;
      params.push(certificate_type);
    }
    sql += ` ORDER BY COALESCE(ct.is_default, false) DESC, ct.created_at DESC`;

    const result = await pool.query(sql, params);
    res.json({ templates: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get template by id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM certificate_templates WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Template not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Create template
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      certificate_type,
      html_template,
      logo_url,
      include_profile_photo,
      is_active,
      is_default,
      paper_size,
      orientation
    } = req.body;
    if (!name || !certificate_type || !html_template) {
      return res.status(400).json({ error: 'name, certificate_type and html_template are required' });
    }
    if (paper_size && !['A4', 'LEGAL'].includes(paper_size)) {
      return res.status(400).json({ error: 'Invalid paper size. Use A4 or LEGAL.' });
    }
    if (orientation && !['portrait', 'landscape'].includes(orientation)) {
      return res.status(400).json({ error: 'Invalid orientation. Use portrait or landscape.' });
    }

    if (is_default) {
      await pool.query(
        `UPDATE certificate_templates
         SET is_default = false, updated_at = CURRENT_TIMESTAMP
         WHERE certificate_type = $1`,
        [certificate_type]
      );
    }

    const result = await pool.query(
      `INSERT INTO certificate_templates
       (name, certificate_type, html_template, logo_url, include_profile_photo, is_active, is_default, paper_size, orientation, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        certificate_type,
        html_template,
        logo_url || null,
        !!include_profile_photo,
        is_active !== false,
        !!is_default,
        paper_size || 'A4',
        orientation || 'portrait',
        req.user.id
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update template
router.put('/:id', async (req, res, next) => {
  try {
    const {
      name,
      certificate_type,
      html_template,
      logo_url,
      include_profile_photo,
      is_active,
      is_default,
      paper_size,
      orientation
    } = req.body;
    const updates = [];
    const params = [];
    let p = 1;
    if (paper_size && !['A4', 'LEGAL'].includes(paper_size)) {
      return res.status(400).json({ error: 'Invalid paper size. Use A4 or LEGAL.' });
    }
    if (orientation && !['portrait', 'landscape'].includes(orientation)) {
      return res.status(400).json({ error: 'Invalid orientation. Use portrait or landscape.' });
    }

    if (is_default) {
      const templateTypeResult = await pool.query(
        `SELECT certificate_type FROM certificate_templates WHERE id = $1`,
        [req.params.id]
      );
      const typeForDefault = certificate_type || templateTypeResult.rows[0]?.certificate_type;
      if (typeForDefault) {
        await pool.query(
          `UPDATE certificate_templates
           SET is_default = false, updated_at = CURRENT_TIMESTAMP
           WHERE certificate_type = $1 AND id <> $2`,
          [typeForDefault, req.params.id]
        );
      }
    }

    const fields = {
      name,
      certificate_type,
      html_template,
      logo_url,
      include_profile_photo,
      is_active,
      is_default,
      paper_size,
      orientation
    };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) {
        updates.push(`${k} = $${p++}`);
        params.push(k === 'include_profile_photo' || k === 'is_active' || k === 'is_default' ? !!v : v);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.params.id);

    const result = await pool.query(
      `UPDATE certificate_templates SET ${updates.join(', ')} WHERE id = $${p} RETURNING *`,
      params
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Template not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete template
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`DELETE FROM certificate_templates WHERE id = $1 RETURNING id`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

