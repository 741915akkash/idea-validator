import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';

const DEFAULT_STAGES = [
  { name: 'New Lead', position: 1 },
  { name: 'Qualified', position: 2 },
  { name: 'Proposal Sent', position: 3 },
  { name: 'Negotiation', position: 4 },
  { name: 'Closed Won', position: 5 },
];

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);

  let result = await pool.query(`
    SELECT * FROM pipeline_stages
    WHERE user_id = $1
    ORDER BY position ASC
  `, [userId]);

  if (!result.rows.length) {
    await pool.query(
      `
      INSERT INTO pipeline_stages (name, position, user_id)
      VALUES
        ($1, $2, $3),
        ($4, $5, $6),
        ($7, $8, $9),
        ($10, $11, $12),
        ($13, $14, $15)
      ON CONFLICT DO NOTHING
      `,
      [
        DEFAULT_STAGES[0].name, DEFAULT_STAGES[0].position,
        userId,
        DEFAULT_STAGES[1].name, DEFAULT_STAGES[1].position,
        userId,
        DEFAULT_STAGES[2].name, DEFAULT_STAGES[2].position,
        userId,
        DEFAULT_STAGES[3].name, DEFAULT_STAGES[3].position,
        userId,
        DEFAULT_STAGES[4].name, DEFAULT_STAGES[4].position,
        userId,
      ],
    );

    result = await pool.query(`
      SELECT * FROM pipeline_stages
      WHERE user_id = $1
      ORDER BY position ASC
    `, [userId]);
  }

  return result.rows;
});
