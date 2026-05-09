import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';
import { requireQuizAccess } from '../../../utils/quizAccess.js';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const body = await readBody(event);
  const quizId = typeof body?.quiz_id === 'string' ? body.quiz_id.trim() : '';

  const stageId = Number(body?.id);
  const name = String(body?.name || '').trim();
  const color = typeof body?.color === 'string' ? body.color.trim() : '';

  if (!Number.isInteger(stageId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stage id' });
  }

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Stage name is required' });
  }

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' });
  }

  await requireQuizAccess(pool, event, quizId);

  if (color && !HEX_COLOR_REGEX.test(color)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid color' });
  }

  let result;
  try {
    result = await pool.query(
      `
      UPDATE pipeline_stages
      SET name = $1,
          color = $2
      WHERE id = $3
        AND user_id = $4
        AND quiz_id = $5
      RETURNING *
      `,
      [name, color || null, stageId, userId, quizId],
    );
  } catch (error) {
    if (error?.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Stage name already exists' });
    }

    // Backward-compatible fallback while color column rolls out.
    if (error?.code !== '42703') {
      throw error;
    }

    try {
      result = await pool.query(
        `
        UPDATE pipeline_stages
        SET name = $1
        WHERE id = $2
          AND user_id = $3
          AND quiz_id = $4
        RETURNING *
        `,
        [name, stageId, userId, quizId],
      );
    } catch (fallbackError) {
      if (fallbackError?.code === '23505') {
        throw createError({ statusCode: 409, statusMessage: 'Stage name already exists' });
      }

      throw fallbackError;
    }

    if (result.rows[0]) {
      result.rows[0].color = color || null;
    }
  }

  if (!result.rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Stage not found' });
  }

  return result.rows[0];
});
