export async function loadCurrentApproved({ client, workspaceId, artifactType }) {
  const { rows } = await client.query(
    `
    SELECT
      id,
      workspace_id,
      type,
      status
    FROM artifacts
    WHERE
      workspace_id = $1
      AND type = $2
      AND status = 'approved'
    LIMIT 1
    `,
    [workspaceId, artifactType]
  )

  if (rows.length === 0) {
    return null
  }

  return {
    id: rows[0].id,
    workspaceId: rows[0].workspace_id,
    type: rows[0].type,
    status: rows[0].status
  }
}
