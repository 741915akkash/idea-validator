import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const { id } = getQuery(event);

  await pool.query(
    `
    DELETE FROM leads
    WHERE id = $1
      AND user_id = $2
    `,
    [id, userId],
  );

  return { success: true };
});
