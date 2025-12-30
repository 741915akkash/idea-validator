import { pool } from '../../db';

export default defineEventHandler(async (event) => {
  const { quiz_id, checkpoint } = await readBody(event);

  await pool.query(
    `
    UPDATE quiz_checkpoints
    SET status = 'COMPLETED'
    WHERE quiz_id = $1 AND checkpoint = $2
    `,
    [quiz_id, checkpoint]
  );

  await pool.query(
    `
    UPDATE quiz_state
    SET current_checkpoint = current_checkpoint + 1,
        last_updated = now()
    WHERE quiz_id = $1
    `,
    [quiz_id]
  );

  return { ok: true };
});
