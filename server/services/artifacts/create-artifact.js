import { getNextRevisionNumber } from './versioning.js'
import ArtifactService from '../../artifacts/service.js'
import { ARTIFACT_LIFECYCLE } from '../../artifacts/constants.js'

export async function createArtifact({ client, workspaceContext, agent, artifact }) {
  const workspaceId = workspaceContext.workspace.id
  const quizId = workspaceContext.quiz.current?.id ?? null

  const lifecycle = ArtifactService.getLifecycle(artifact.type)

  let revisionNumber

  switch (lifecycle) {
    case ARTIFACT_LIFECYCLE.IMMUTABLE:
      revisionNumber = 1
      break

    case ARTIFACT_LIFECYCLE.VERSIONED:
      revisionNumber = await getNextRevisionNumber({
        client,
        workspaceId,
        artifactType: artifact.type
      })
      break

    default:
      throw new Error(`Unknown lifecycle "${lifecycle}" for artifact "${artifact.type}".`)
  }

  const { rows } = await client.query(
    `
    INSERT INTO artifacts (
      workspace_id,
      quiz_id,
      task_id,
      type,
      title,
      summary,
      content_json,
      source_agent,
      created_by,
      status,
      revision_number
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      NULL,
      'draft',
      $9
    )
    RETURNING
      id,
      type,
      revision_number,
      status
    `,
    [
      workspaceId,
      quizId,
      artifact.taskId ?? null,
      artifact.type,
      artifact.title ?? null,
      artifact.summary ?? null,
      artifact.content,
      agent.id,
      revisionNumber
    ]
  )

  const row = rows[0]

  return {
    id: row.id,
    type: row.type,
    revisionNumber: row.revision_number,
    status: row.status
  }
}
