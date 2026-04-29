import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const body = await readBody(event);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Name required' });
  }

  const existing = await pool.query(
    `
    SELECT id, name, user_id, created_at
    FROM sources
    WHERE user_id = $1
      AND lower(name) = lower($2)
    LIMIT 1
    `,
    [userId, name],
  );

  if (existing.rows.length) {
    return existing.rows[0];
  }

  const inserted = await pool.query(
    `
    INSERT INTO sources (name, user_id)
    VALUES ($1, $2)
    RETURNING id, name, user_id, created_at
    `,
    [name, userId],
  );

  return inserted.rows[0];
});
