import { pool } from '../../db';

export default defineEventHandler(async (event) => {
  const quizId = getQuery(event).quiz_id;

  const { rows } = await pool.query(
    `SELECT * FROM quiz_results WHERE quiz_id = $1`,
    [quizId]
  );

  return rows[0] || null;
});
