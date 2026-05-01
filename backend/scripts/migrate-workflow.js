import pool from '../config/database.js';

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Starting workflow updates migration...');

    // 1. Create email_notifications table
    console.log('Creating email_notifications table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(50),
        recipient_email VARCHAR(255),
        subject VARCHAR(255),
        tracking_number VARCHAR(50),
        status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'pending', 'failed')),
        details TEXT,
        error_message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ email_notifications table created');

    // 2. Update certificate_requests table
    console.log('Updating certificate_requests table...');

    // Check and add columns if they don't exist
    const describeResult = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='certificate_requests'
    `);
    const existingColumns = describeResult.rows.map(r => r.column_name);

    if (!existingColumns.includes('purok_cert_url')) {
      await client.query(`
        ALTER TABLE certificate_requests 
        ADD COLUMN purok_cert_url TEXT
      `);
      console.log('✓ Added purok_cert_url column');
    }

    if (!existingColumns.includes('sanitary_card_url')) {
      await client.query(`
        ALTER TABLE certificate_requests 
        ADD COLUMN sanitary_card_url TEXT
      `);
      console.log('✓ Added sanitary_card_url column');
    }

    if (!existingColumns.includes('rejection_reason')) {
      await client.query(`
        ALTER TABLE certificate_requests 
        ADD COLUMN rejection_reason TEXT
      `);
      console.log('✓ Added rejection_reason column');
    }

    if (!existingColumns.includes('flagged_reason')) {
      await client.query(`
        ALTER TABLE certificate_requests 
        ADD COLUMN flagged_reason TEXT
      `);
      console.log('✓ Added flagged_reason column');
    }

    if (!existingColumns.includes('email_sent')) {
      await client.query(`
        ALTER TABLE certificate_requests 
        ADD COLUMN email_sent BOOLEAN DEFAULT FALSE
      `);
      console.log('✓ Added email_sent column');
    }

    if (!existingColumns.includes('reporter_email')) {
      await client.query(`
        ALTER TABLE certificate_requests 
        ADD COLUMN reporter_email VARCHAR(255)
      `);
      console.log('✓ Added reporter_email column');
    }

    // 3. Update certificate_requests status constraint
    console.log('Updating certificate_requests status constraint...');
    await client.query(`
      ALTER TABLE certificate_requests 
      DROP CONSTRAINT IF EXISTS certificate_requests_status_check
    `);
    await client.query(`
      ALTER TABLE certificate_requests 
      ADD CONSTRAINT certificate_requests_status_check 
      CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'released'))
    `);
    console.log('✓ Updated status constraint for certificates');

    // 4. Update complaints table
    console.log('Updating complaints table...');
    
    const complaintDescribe = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='complaints'
    `);
    const complaintColumns = complaintDescribe.rows.map(r => r.column_name);

    if (!complaintColumns.includes('tracking_number')) {
      await client.query(`
        ALTER TABLE complaints 
        ADD COLUMN tracking_number VARCHAR(50) UNIQUE
      `);
      console.log('✓ Added tracking_number column');
    }

    if (!complaintColumns.includes('reason_for_update')) {
      await client.query(`
        ALTER TABLE complaints 
        ADD COLUMN reason_for_update TEXT
      `);
      console.log('✓ Added reason_for_update column');
    }

    if (!complaintColumns.includes('email_sent')) {
      await client.query(`
        ALTER TABLE complaints 
        ADD COLUMN email_sent BOOLEAN DEFAULT FALSE
      `);
      console.log('✓ Added email_sent column');
    }

    if (!complaintColumns.includes('reporter_email')) {
      await client.query(`
        ALTER TABLE complaints 
        ADD COLUMN reporter_email VARCHAR(255)
      `);
      console.log('✓ Added reporter_email column');
    }

    // 5. Normalize existing complaint statuses before updating constraint
    console.log('Normalizing existing complaint statuses...');
    await client.query(`
      UPDATE complaints
      SET status = CASE
        WHEN status = 'pending' THEN 'submitted'
        WHEN status = 'validated' THEN 'under_review'
        WHEN status = 'archived' THEN 'closed'
        ELSE status
      END
    `);
    console.log('✓ Complaint statuses normalized');

    // 6. Update complaints status constraint
    console.log('Updating complaints status constraint...');
    await client.query(`
      ALTER TABLE complaints 
      DROP CONSTRAINT IF EXISTS complaints_status_check
    `);
    await client.query(`
      ALTER TABLE complaints 
      ADD CONSTRAINT complaints_status_check 
      CHECK (status IN ('submitted', 'under_review', 'resolved', 'closed'))
    `);
    console.log('✓ Updated status constraint for complaints');

    // 7. Update certificate_templates table for workflow control
    console.log('Updating certificate_templates table...');
    const templateDescribe = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='certificate_templates'
    `);
    const templateColumns = templateDescribe.rows.map(r => r.column_name);

    if (!templateColumns.includes('is_active')) {
      await client.query(`
        ALTER TABLE certificate_templates
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE
      `);
      console.log('✓ Added is_active column');
    }

    if (!templateColumns.includes('is_default')) {
      await client.query(`
        ALTER TABLE certificate_templates
        ADD COLUMN is_default BOOLEAN DEFAULT FALSE
      `);
      console.log('✓ Added is_default column');
    }

    if (!templateColumns.includes('paper_size')) {
      await client.query(`
        ALTER TABLE certificate_templates
        ADD COLUMN paper_size VARCHAR(20) DEFAULT 'A4'
      `);
      await client.query(`
        ALTER TABLE certificate_templates
        DROP CONSTRAINT IF EXISTS certificate_templates_paper_size_check
      `);
      await client.query(`
        ALTER TABLE certificate_templates
        ADD CONSTRAINT certificate_templates_paper_size_check
        CHECK (paper_size IN ('A4', 'LEGAL'))
      `);
      console.log('✓ Added paper_size column');
    }

    if (!templateColumns.includes('orientation')) {
      await client.query(`
        ALTER TABLE certificate_templates
        ADD COLUMN orientation VARCHAR(20) DEFAULT 'portrait'
      `);
      await client.query(`
        ALTER TABLE certificate_templates
        DROP CONSTRAINT IF EXISTS certificate_templates_orientation_check
      `);
      await client.query(`
        ALTER TABLE certificate_templates
        ADD CONSTRAINT certificate_templates_orientation_check
        CHECK (orientation IN ('portrait', 'landscape'))
      `);
      console.log('✓ Added orientation column');
    }

    // 8. Update certificate_requests for package processing
    console.log('Updating certificate_requests package columns...');
    const certDescribe = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='certificate_requests'
    `);
    const certColumns = certDescribe.rows.map(r => r.column_name);

    if (!certColumns.includes('package_group_id')) {
      await client.query(`
        ALTER TABLE certificate_requests
        ADD COLUMN package_group_id UUID
      `);
      console.log('✓ Added package_group_id column');
    }

    if (!certColumns.includes('package_name')) {
      await client.query(`
        ALTER TABLE certificate_requests
        ADD COLUMN package_name VARCHAR(255)
      `);
      console.log('✓ Added package_name column');
    }

    if (!certColumns.includes('package_item_name')) {
      await client.query(`
        ALTER TABLE certificate_requests
        ADD COLUMN package_item_name VARCHAR(255)
      `);
      console.log('✓ Added package_item_name column');
    }

    // 8.5 Update announcements for media support
    console.log('Updating announcements table...');
    const announcementDescribe = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='announcements'
    `);
    const announcementColumns = announcementDescribe.rows.map(r => r.column_name);
    if (!announcementColumns.includes('image_url')) {
      await client.query(`
        ALTER TABLE announcements
        ADD COLUMN image_url TEXT
      `);
      console.log('✓ Added image_url column');
    }

    // 9. Create indexes for email_notifications
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_email_notifications_tracking 
      ON email_notifications(tracking_number)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_email_notifications_status 
      ON email_notifications(status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at 
      ON email_notifications(sent_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_certificate_requests_package_group
      ON certificate_requests(package_group_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_certificate_templates_active_default
      ON certificate_templates(certificate_type, is_active, is_default)
    `);
    console.log('✓ Indexes created');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
