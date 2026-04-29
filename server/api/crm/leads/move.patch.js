import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const body = await readBody(event);

  await pool.query(
    `
    UPDATE leads
    SET stage_id = $1,
        updated_at = NOW()
    WHERE id = $2
      AND user_id = $3
    `,
    [body.stage_id, body.lead_id, userId]
  );

  return { success: true };
});
