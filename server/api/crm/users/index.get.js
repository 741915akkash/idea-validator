import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';
import { requireQuizAccess } from '../../../utils/quizAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const { quiz_id: quizIdRaw } = getQuery(event);
  const quizId = typeof quizIdRaw === 'string' ? quizIdRaw.trim() : '';

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' });
  }

  await requireQuizAccess(pool, event, quizId);

  const result = await pool.query(`
    SELECT id, name, email, created_at
    FROM users
    WHERE id = $1
    ORDER BY id ASC
  `, [userId]);

  return result.rows;
});
