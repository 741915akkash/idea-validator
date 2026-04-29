import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);

  const result = await pool.query(`
    SELECT
      leads.*,
      pipeline_stages.name AS stage,
      users.name AS owner_name,
      users.email AS owner_email,
      sources.name AS source_name,
      sequences.title AS sequence_name,
      CASE
        WHEN leads.sequence_id IS NULL THEN NULL
        ELSE json_build_object(
          'id', leads.sequence_id,
          'name', sequences.title,
          'current_step', leads.current_step,
          'total_steps', (
            SELECT COUNT(*)::int
            FROM sequence_steps ss_total
            WHERE ss_total.sequence_id = leads.sequence_id
          ),
          'current_step_type', (
            SELECT ss_current.type
            FROM sequence_steps ss_current
            WHERE ss_current.sequence_id = leads.sequence_id
              AND ss_current.step_number = leads.current_step
            LIMIT 1
          ),
          'next_follow_up_at', leads.next_follow_up_at
        )
      END AS sequence
    FROM leads
    LEFT JOIN pipeline_stages
      ON leads.stage_id = pipeline_stages.id
    LEFT JOIN users
      ON leads.user_id = users.id
    LEFT JOIN sources
      ON leads.source_id = sources.id
    LEFT JOIN sequences
      ON leads.sequence_id = sequences.id
    WHERE leads.user_id = $1
    ORDER BY leads.created_at DESC
  `, [userId]);

  return result.rows;
});
