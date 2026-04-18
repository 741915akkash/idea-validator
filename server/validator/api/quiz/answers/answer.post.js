import { pool } from '../../../db';
import { requireQuizAccess } from '../../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { quiz_id, question_id, selected_option } = body;

  const client = await pool.connect()
  try {
    await requireQuizAccess(client, event, quiz_id)

    await client.query(
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
  } finally {
    client.release()
  }

  return { ok: true };
});
