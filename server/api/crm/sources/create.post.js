import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';
import { requireQuizAccess } from '../../../utils/quizAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const body = await readBody(event);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const quizId = typeof body?.quiz_id === 'string' ? body.quiz_id.trim() : '';

  if (!name || !quizId) {
    throw createError({ statusCode: 400, statusMessage: 'Name and quiz_id required' });
  }

  await requireQuizAccess(pool, event, quizId);

  const existing = await pool.query(
    `
    SELECT id, name, user_id, created_at
    FROM sources
    WHERE user_id = $1
      AND quiz_id = $3
      AND lower(name) = lower($2)
    LIMIT 1
    `,
    [userId, name, quizId],
  );

  if (existing.rows.length) {
    return existing.rows[0];
  }

  const inserted = await pool.query(
    `
    INSERT INTO sources (name, user_id, quiz_id)
    VALUES ($1, $2, $3)
    RETURNING id, name, user_id, quiz_id, created_at
    `,
    [name, userId, quizId],
  );

  return inserted.rows[0];
});
