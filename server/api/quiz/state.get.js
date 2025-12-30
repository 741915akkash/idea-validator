import { pool } from '../../db';

export default defineEventHandler(async (event) => {
  const quizId = getQuery(event).quiz_id;

  const { rows } = await pool.query(
    `
    SELECT
      q.status,
      qs.current_checkpoint
    FROM quizzes q
    JOIN quiz_state qs ON qs.quiz_id = q.id
    WHERE q.id = $1
    `,
    [quizId]
  );

  return rows[0];
});
