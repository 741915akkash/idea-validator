import { pool } from '../../db/index.js'

export async function getNextRevisionNumber({ workspaceId, artifactType, client = pool }) {
  const { rows } = await client.query(
    `
    SELECT
      COALESCE(MAX(revision_number), 0) + 1 AS revision_number
    FROM artifacts
    WHERE workspace_id = $1
      AND type = $2
    `,
    [workspaceId, artifactType]
  )

  return rows[0].revision_number
}

export async function getLatestRevision({ workspaceId, artifactType, client = pool }) {
  const { rows } = await client.query(
    `
    SELECT
      id,
      revision_number,
      status
    FROM artifacts
    WHERE workspace_id = $1
      AND type = $2
    ORDER BY revision_number DESC
    LIMIT 1
    `,
    [workspaceId, artifactType]
  )

  return rows[0] ?? null
}
