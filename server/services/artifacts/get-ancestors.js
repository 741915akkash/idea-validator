import { pool } from '../../db/index.js'

export async function getAncestors(artifactId) {
  const { rows } = await pool.query(
    `
    WITH RECURSIVE ancestors AS (

      SELECT
        d.parent_artifact_id AS artifact_id,
        1 AS depth

      FROM artifact_dependencies d

      WHERE d.child_artifact_id = $1

      UNION ALL

      SELECT
        d.parent_artifact_id,
        a.depth + 1

      FROM artifact_dependencies d

      INNER JOIN ancestors a
        ON d.child_artifact_id = a.artifact_id
    )

    SELECT DISTINCT
      art.id,
      art.type,
      art.title,
      art.summary,
      art.content_json,
      art.source_agent,
      art.created_at,
      ancestors.depth

    FROM ancestors

    INNER JOIN artifacts art
      ON art.id = ancestors.artifact_id

    ORDER BY
      ancestors.depth,
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
