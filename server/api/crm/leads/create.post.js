import { pool } from '../../../db/index.js';
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js';

const UUID_V4_OR_V1_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default defineEventHandler(async (event) => {
  const { userId: authUserId } = await requireCrmEnabled(event);
  const body = await readBody(event);
  const stageId = Number(body.stage_id);
  const ownerId = typeof body.user_id === 'string' && body.user_id.trim() ? body.user_id.trim() : authUserId;
  const sequenceId = body.sequence_id === null || body.sequence_id === undefined || body.sequence_id === ''
    ? null
    : Number(body.sequence_id);

  if (!Number.isInteger(stageId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stage_id' });
  }

  if (sequenceId !== null && !Number.isInteger(sequenceId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sequence_id' });
  }

  if (!UUID_V4_OR_V1_REGEX.test(ownerId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user_id' });
  }

  const result = await pool.query(
    `
    WITH selected_stage AS (
      SELECT id
      FROM pipeline_stages
      WHERE id = $4
        AND user_id = $6
      LIMIT 1
    ),
    selected_sequence AS (
      SELECT id
      FROM sequences
      WHERE id = $7
        AND user_id = $6
      LIMIT 1
    ),
    first_sequence_step AS (
      SELECT offset_days
      FROM sequence_steps
      WHERE sequence_id = (SELECT id FROM selected_sequence)
      ORDER BY step_number ASC
      LIMIT 1
    ),
    inserted AS (
      INSERT INTO leads (name, company, email, stage_id, user_id, sequence_id, current_step, next_follow_up_at)
      SELECT
        $1,
        $2,
        $3,
        selected_stage.id,
        $5,
        (SELECT id FROM selected_sequence),
        CASE WHEN (SELECT id FROM selected_sequence) IS NULL THEN NULL ELSE 1 END,
        CASE
          WHEN (SELECT id FROM selected_sequence) IS NULL THEN NULL
          ELSE NOW() + ((COALESCE((SELECT offset_days FROM first_sequence_step), 0))::text || ' days')::interval
        END
      FROM selected_stage
      WHERE $7 IS NULL OR EXISTS (SELECT 1 FROM selected_sequence)
      RETURNING *
    )
    SELECT
      inserted.*,
      pipeline_stages.name AS stage,
      users.name AS owner_name,
      users.email AS owner_email,
      sequences.title AS sequence_name,
      CASE
        WHEN inserted.sequence_id IS NULL THEN NULL
        ELSE json_build_object(
          'id', inserted.sequence_id,
          'name', sequences.title,
          'current_step', inserted.current_step,
          'total_steps', (
            SELECT COUNT(*)::int
            FROM sequence_steps ss_total
            WHERE ss_total.sequence_id = inserted.sequence_id
          ),
          'current_step_type', (
            SELECT ss_current.type
            FROM sequence_steps ss_current
            WHERE ss_current.sequence_id = inserted.sequence_id
              AND ss_current.step_number = inserted.current_step
            LIMIT 1
          ),
          'next_follow_up_at', inserted.next_follow_up_at
        )
      END AS sequence
    FROM inserted
    LEFT JOIN pipeline_stages
      ON inserted.stage_id = pipeline_stages.id
    LEFT JOIN users
      ON inserted.user_id = users.id
    LEFT JOIN sequences
      ON inserted.sequence_id = sequences.id
    `,
    [body.name, body.company, body.email, stageId, ownerId, authUserId, sequenceId],
  );

  if (!result.rows.length) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stage_id or sequence_id' });
  }

  return result.rows[0];
});
