import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function fixAdminPassword() {
  try {
    const password_hash = bcrypt.hashSync('admin123', 10);
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1 
       WHERE email = 'admin@barangaycatarman.gov.ph' 
       RETURNING id, email`,
      [password_hash]
    );
    
    if (result.rows.length === 0) {
      // Admin doesn't exist, insert them
      await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, status) 
         VALUES ('System Administrator', 'admin@barangaycatarman.gov.ph', $1, 'admin', 'active')
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [password_hash]
      );
      console.log('✅ Admin user created/updated. Login with admin@barangaycatarman.gov.ph / admin123');
    } else {
      console.log('✅ Admin password fixed! Login with admin@barangaycatarman.gov.ph / admin123');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdminPassword();
