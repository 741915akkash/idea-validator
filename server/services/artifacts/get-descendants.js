import { pool } from '../../db/index.js'

export async function getDescendants(artifactId) {
  const { rows } = await pool.query(
    `
    WITH RECURSIVE descendants AS (

      SELECT
        d.child_artifact_id AS artifact_id,
        1 AS depth

      FROM artifact_dependencies d

      WHERE d.parent_artifact_id = $1

      UNION ALL

      SELECT
        d.child_artifact_id,
        d2.depth + 1

      FROM artifact_dependencies d

      INNER JOIN descendants d2
        ON d.parent_artifact_id = d2.artifact_id
    )

    SELECT DISTINCT
      art.id,
      art.type,
      art.title,
      art.summary,
      art.content_json,
      art.source_agent,
      art.created_at,
      descendants.depth

    FROM descendants

    INNER JOIN artifacts art
      ON art.id = descendants.artifact_id

    ORDER BY
      descendants.depth,
      art.created_at DESC
    `,
    [artifactId]
  )

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    summary: row.summary,
    content: row.content_json,
    sourceAgent: row.source_agent,
    createdAt: row.created_at,
    depth: row.depth
  }))
}
