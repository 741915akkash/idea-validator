import { pool } from '../../db';

export default defineEventHandler(async (event) => {
  const { quiz_id } = await readBody(event);

  await pool.query(
    `
    UPDATE quizzes
    SET status = 'READY_TO_SCORE'
    WHERE id = $1
    `,
    [quiz_id]
  );

  return { ok: true };
});
