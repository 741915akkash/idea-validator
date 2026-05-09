import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';
import { requireQuizAccess } from '../../../utils/quizAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const body = await readBody(event);
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  const quizId = typeof body?.quiz_id === 'string' ? body.quiz_id.trim() : '';

  if (!id || !quizId) {
    throw createError({ statusCode: 400, statusMessage: 'Source id and quiz_id required' });
  }

  await requireQuizAccess(pool, event, quizId);

  await pool.query(
    `
    DELETE FROM sources
    WHERE id = $1
      AND user_id = $2
      AND quiz_id = $3
    `,
    [id, userId, quizId],
  );

  return { success: true };
});
