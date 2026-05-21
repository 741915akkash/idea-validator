import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';
import { requireQuizAccess } from '../../../utils/quizAccess.js';

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event);
  const { quiz_id: quizIdRaw } = getQuery(event);
  const quizId = typeof quizIdRaw === 'string' ? quizIdRaw.trim() : '';

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' });
  }

  await requireQuizAccess(pool, event, quizId);

  const result = await pool.query(`
    SELECT
      leads.*,
      pipeline_stages.name AS stage,
      users.name AS owner_name,
      users.email AS owner_email,
      sources.name AS source_name,
      sequences.title AS sequence_name,
      activity_search.activity_text AS activities_text,
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
    LEFT JOIN LATERAL (
      SELECT string_agg(COALESCE(la.text, ''), ' ' ORDER BY la.created_at DESC) AS activity_text
      FROM lead_activities la
      WHERE la.lead_id = leads.id
    ) AS activity_search ON true
    WHERE leads.user_id = $1
      AND leads.quiz_id = $2
    ORDER BY leads.created_at DESC
  `, [userId, quizId]);

  return result.rows;
});
