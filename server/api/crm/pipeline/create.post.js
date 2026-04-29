import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const body = await readBody(event);
  const position = Number(body.position);

  if (!body?.name || !Number.isInteger(position)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid name or position' });
  }

  const result = await pool.query(
    `
    INSERT INTO pipeline_stages (name, position, user_id)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [body.name, position, userId],
  );

  return result.rows[0];
});
