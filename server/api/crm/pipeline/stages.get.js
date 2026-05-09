import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';
import { requireQuizAccess } from '../../../utils/quizAccess.js';

const DEFAULT_STAGES = [
  { name: 'New Lead', position: 1 },
  { name: 'Qualified', position: 2 },
  { name: 'Proposal Sent', position: 3 },
  { name: 'Negotiation', position: 4 },
  { name: 'Closed Won', position: 5 },
];

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const { quiz_id: quizIdRaw } = getQuery(event);
  const quizId = typeof quizIdRaw === 'string' ? quizIdRaw.trim() : '';

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' });
  }

  await requireQuizAccess(pool, event, quizId);

  let result = await pool.query(`
    SELECT * FROM pipeline_stages
    WHERE user_id = $1
      AND quiz_id = $2
    ORDER BY position ASC
  `, [userId, quizId]);

  if (!result.rows.length) {
    await pool.query(
      `
      INSERT INTO pipeline_stages (name, position, user_id, quiz_id)
      VALUES
        ($1, $2, $3, $4),
        ($5, $6, $7, $8),
        ($9, $10, $11, $12),
        ($13, $14, $15, $16),
        ($17, $18, $19, $20)
      ON CONFLICT DO NOTHING
      `,
      [
        DEFAULT_STAGES[0].name, DEFAULT_STAGES[0].position,
        userId, quizId,
        DEFAULT_STAGES[1].name, DEFAULT_STAGES[1].position,
        userId, quizId,
        DEFAULT_STAGES[2].name, DEFAULT_STAGES[2].position,
        userId, quizId,
        DEFAULT_STAGES[3].name, DEFAULT_STAGES[3].position,
        userId, quizId,
        DEFAULT_STAGES[4].name, DEFAULT_STAGES[4].position,
        userId, quizId,
      ],
    );

    result = await pool.query(`
      SELECT * FROM pipeline_stages
      WHERE user_id = $1
        AND quiz_id = $2
      ORDER BY position ASC
    `, [userId, quizId]);
  }

  return result.rows;
});
