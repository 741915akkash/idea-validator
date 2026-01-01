import { pool } from '../../db';

export default defineEventHandler(async (event) => {
  const { quiz_id, checkpoint } = await readBody(event);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1️⃣ Verify quiz + current checkpoint
    const stateRes = await client.query(
      `
      SELECT current_checkpoint
      FROM quiz_state
      WHERE quiz_id = $1
      `,
      [quiz_id]
    );

    if (stateRes.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Quiz state not found'
      });
    }

    if (stateRes.rows[0].current_checkpoint !== checkpoint) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Checkpoint is not current'
      });
    }

    // 2️⃣ Check for unanswered questions (THIS IS THE KEY PART)
    const missingRes = await client.query(
      `
      SELECT q.id
      FROM questions q
      LEFT JOIN answers a
        ON a.question_id = q.id
        AND a.quiz_id = $1
      WHERE q.checkpoint = $2
        AND a.id IS NULL
      `,
      [quiz_id, checkpoint]
    );

    if (missingRes.rows.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All questions must be answered'
      });
    }

    // 3️⃣ Mark checkpoint completed
    await client.query(
      `
      UPDATE quiz_checkpoints
      SET status = 'COMPLETED'
      WHERE quiz_id = $1 AND checkpoint = $2
      `,
      [quiz_id, checkpoint]
    );

    // 4️⃣ Advance state
    await client.query(
      `
      UPDATE quiz_state
      SET current_checkpoint = current_checkpoint + 1,
          last_updated = now()
      WHERE quiz_id = $1
      `,
      [quiz_id]
    );

    await client.query('COMMIT');
    return { ok: true };

  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});
