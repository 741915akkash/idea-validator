import { pool } from '../../db/index.js';

export default defineEventHandler(async () => {
  const result = await pool.query('SELECT NOW()');

  return result.rows[0];
});
