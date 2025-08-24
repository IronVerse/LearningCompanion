import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('[db] DATABASE_URL is not set. Using default local URL.');
}

const pool = new Pool({
  connectionString: connectionString || 'postgres://tutor:tutorpw@localhost:5432/tutor',
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);
export { pool };
export default { query, pool };
