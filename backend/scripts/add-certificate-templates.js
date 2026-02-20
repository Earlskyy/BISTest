import pool from '../config/database.js';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificate_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        certificate_type VARCHAR(100) NOT NULL,
        html_template TEXT NOT NULL,
        logo_url TEXT,
        include_profile_photo BOOLEAN NOT NULL DEFAULT FALSE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // certificate_requests additions for template/profile photo
    await client.query(`ALTER TABLE certificate_requests ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;`);
    await client.query(`ALTER TABLE certificate_requests ADD COLUMN IF NOT EXISTS template_id UUID;`);
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_certificate_requests_template'
        ) THEN
          ALTER TABLE certificate_requests
            ADD CONSTRAINT fk_certificate_requests_template
            FOREIGN KEY (template_id) REFERENCES certificate_templates(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_certificate_templates_type ON certificate_templates(certificate_type);`);

    // Seed a temporary default template (if none exist)
    const existing = await client.query(`SELECT COUNT(*)::int AS c FROM certificate_templates;`);
    if (existing.rows[0].c === 0) {
      await client.query(
        `INSERT INTO certificate_templates (name, certificate_type, html_template, include_profile_photo)
         VALUES ($1, $2, $3, $4)`,
        [
          'Default Barangay Certificate (Temporary)',
          'Certificate of Residency',
          `\n<div style=\"font-family: Arial, sans-serif; padding: 24px;\">\n  <div style=\"text-align:center;\">\n    {{#logo_url}}<img src=\"{{logo_url}}\" alt=\"Logo\" style=\"height:80px;\" />{{/logo_url}}\n    <h2 style=\"margin:8px 0;\">BARANGAY CATARMAN</h2>\n    <div>Republic of the Philippines</div>\n    <div>Province of Northern Samar</div>\n  </div>\n\n  <h3 style=\"text-align:center; margin-top:24px;\">{{certificate_type}}</h3>\n\n  <p style=\"margin-top:24px;\">TO WHOM IT MAY CONCERN:</p>\n\n  <p style=\"line-height:1.6;\">\n    This is to certify that <strong>{{full_name}}</strong>, {{age}} years old, {{civil_status}}, is a resident of <strong>{{address}}</strong>.\n  </p>\n\n  {{#purpose}}\n  <p style=\"line-height:1.6;\">This certificate is being issued for <strong>{{purpose}}</strong>.</p>\n  {{/purpose}}\n\n  <p style=\"margin-top:24px;\">Reference No.: <strong>{{reference_number}}</strong></p>\n\n  {{#include_profile_photo}}\n  <div style=\"margin-top:24px;\">\n    <div style=\"border:1px solid #ccc; width:140px; height:140px; display:flex; align-items:center; justify-content:center;\">\n      {{#profile_photo_url}}<img src=\"{{profile_photo_url}}\" alt=\"Profile\" style=\"width:140px; height:140px; object-fit:cover;\" />{{/profile_photo_url}}\n      {{^profile_photo_url}}<span style=\"font-size:12px; color:#666;\">PROFILE PHOTO</span>{{/profile_photo_url}}\n    </div>\n  </div>\n  {{/include_profile_photo}}\n\n  <div style=\"margin-top:64px; text-align:center;\">\n    <div style=\"width:240px; border-top:1px solid #000; margin:0 auto;\"></div>\n    <div style=\"margin-top:6px;\">Punong Barangay</div>\n  </div>\n</div>\n`,
          false,
        ]
      );
      console.log('✅ Seeded a temporary default certificate template');
    }

    console.log('✅ Certificate templates migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();

