import { pool } from '../../db';

export default defineEventHandler(async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userRes = await client.query(
      `INSERT INTO users DEFAULT VALUES RETURNING id`
    );
    const userId = userRes.rows[0].id;

    const quizRes = await client.query(
      `INSERT INTO quizzes (user_id, status, started_at)
       VALUES ($1, 'IN_PROGRESS', now())
       RETURNING id`,
      [userId]
    );
    const quizId = quizRes.rows[0].id;

    await client.query(
      `INSERT INTO quiz_state (quiz_id) VALUES ($1)`,
      [quizId]
    );

    await client.query(
      `
      INSERT INTO quiz_checkpoints (quiz_id, checkpoint)
      SELECT $1, checkpoint
      FROM (
        SELECT DISTINCT checkpoint FROM questions
      ) q
      `,
      [quizId]
    );


    await client.query('COMMIT');

    return { quiz_id: quizId };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});
