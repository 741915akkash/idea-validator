import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';
import { requireQuizAccess } from '../../../utils/quizAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const { id, quiz_id: quizIdRaw } = getQuery(event);
  const quizId = typeof quizIdRaw === 'string' ? quizIdRaw.trim() : '';

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' });
  }

  await requireQuizAccess(pool, event, quizId);

  await pool.query(
    `
    DELETE FROM leads
    WHERE id = $1
      AND user_id = $2
      AND quiz_id = $3
    `,
    [id, userId, quizId],
  );

  return { success: true };
});
