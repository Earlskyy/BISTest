import pool from '../config/database.js';

async function migrate() {
  const client = await pool.connect();
  try {
    // Add new columns if they don't exist (PostgreSQL requires separate ADD COLUMN)
    const columns = [
      ['reference_number', 'VARCHAR(50)'],
      ['birth_date', 'DATE'],
      ['age', 'INTEGER'],
      ['civil_status', 'VARCHAR(50)'],
      ['purpose', 'TEXT'],
      ['contact_number', 'VARCHAR(20)'],
    ];
    for (const [col, type] of columns) {
      await client.query(`
        ALTER TABLE certificate_requests 
        ADD COLUMN IF NOT EXISTS ${col} ${type}
      `);
    }
    
    // Generate reference numbers for existing records that don't have one
    const result = await client.query(
      "SELECT id FROM certificate_requests WHERE reference_number IS NULL"
    );
    
    for (const row of result.rows) {
      const refNum = 'BIS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      await client.query(
        'UPDATE certificate_requests SET reference_number = $1 WHERE id = $2',
        [refNum, row.id]
      );
    }
    
    console.log('✅ Certificate fields migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
