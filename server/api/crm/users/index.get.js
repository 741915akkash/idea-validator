import { pool } from '../../../db/index.js';

export default defineEventHandler(async () => {
  const result = await pool.query(`
    SELECT id, name, email, created_at
    FROM users
    ORDER BY id ASC
  `);

  return result.rows;
});
