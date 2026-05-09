import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';
import { requireQuizAccess } from '../../../utils/quizAccess.js';
import {
  getEventEntitlementsFromDb,
  getUsageSnapshot,
  observeCountLimit
} from '../../../utils/track-usage.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const body = await readBody(event);
  const position = Number(body.position);
  const quizId = typeof body?.quiz_id === 'string' ? body.quiz_id.trim() : '';

  if (!body?.name || !Number.isInteger(position) || !quizId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid name, position, or quiz_id' });
  }

  await requireQuizAccess(pool, event, quizId);

  const { tier, limits } = await getEventEntitlementsFromDb({ event, client: pool });
  const usage = await getUsageSnapshot(pool, event);
  const pipelinesLimitCheck = observeCountLimit(event, {
    mode: 'enforce',
    checkpoint: 'crm.pipeline.create',
    key: 'pipelines',
    tier,
    used: usage.pipelines ?? 0,
    limit: limits.pipelines,
    increment: 1
  });

  if (pipelinesLimitCheck.wouldBlock) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Pipelines limit reached for your current plan'
    });
  }

  const result = await pool.query(
    `
    INSERT INTO pipeline_stages (name, position, user_id, quiz_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [body.name, position, userId, quizId],
  );

  return result.rows[0];
});
