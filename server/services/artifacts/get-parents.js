import { pool } from '../../db/index.js'

export async function getParents(artifactId) {
  const { rows } = await pool.query(
    `
    SELECT
      a.id,
      a.type,
      a.title,
      a.summary,
      a.content_json,
      a.source_agent,
      a.created_at
    FROM artifact_dependencies d

    INNER JOIN artifacts a
      ON a.id = d.parent_artifact_id

    WHERE d.child_artifact_id = $1

    ORDER BY a.created_at DESC
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
    createdAt: row.created_at
  }))
}
