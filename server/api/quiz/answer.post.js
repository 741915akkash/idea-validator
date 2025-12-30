import { pool } from '../../db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { quiz_id, question_id, selected_option } = body;

  await pool.query(
    `
    INSERT INTO answers (quiz_id, question_id, selected_option)
    VALUES ($1, $2, $3)
    ON CONFLICT (quiz_id, question_id)
    DO UPDATE SET
      selected_option = EXCLUDED.selected_option,
      answered_at = now()
    `,
    [quiz_id, question_id, selected_option]
  );

  return { ok: true };
});
