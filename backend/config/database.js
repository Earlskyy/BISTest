import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in environment variables');
  console.error('Please check your .env file in the backend directory');
  process.exit(1);
}

// Check if SSL is required (Neon and other cloud providers require SSL)
const requiresSSL = process.env.DATABASE_URL?.includes('sslmode=require') || 
                    process.env.DATABASE_URL?.includes('neon.tech') ||
                    process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: requiresSSL ? { rejectUnauthorized: false } : false
});

// Test connection on startup
pool.connect()
  .then((client) => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err.message);
    console.error('Connection string:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    process.exit(1);
  });

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
