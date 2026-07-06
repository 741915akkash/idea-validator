import { pool } from '../../db/index.js'

export async function approveArtifact({ artifactId, approvedBy = null }) {
  await pool.query(
    `
    UPDATE artifacts
    SET
      status = 'approved',
      approved_by = $2,
      approved_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    `,
    [artifactId, approvedBy]
  )
}

export async function archiveArtifact(artifactId) {
  await pool.query(
    `
    UPDATE artifacts
    SET
      status = 'archived',
      updated_at = NOW()
    WHERE id = $1
    `,
    [artifactId]
  )
}

export async function markSuperseded({ artifactId, supersededBy }) {
  await pool.query(
    `
    UPDATE artifacts
    SET
      status = 'superseded',
      superseded_by = $2,
      updated_at = NOW()
    WHERE id = $1
    `,
    [artifactId, supersededBy]
  )
}

export async function markGenerating(artifactId) {
  await pool.query(
    `
    UPDATE artifacts
    SET
      status = 'generating',
      updated_at = NOW()
    WHERE id = $1
    `,
    [artifactId]
  )
}

export async function markFailed(artifactId) {
  await pool.query(
    `
    UPDATE artifacts
    SET
      status = 'failed',
      updated_at = NOW()
    WHERE id = $1
    `,
    [artifactId]
  )
}
