import { pool } from '../../db/index.js'

import { insertArtifacts } from './insert-artifacts.js'
import { insertTasks } from './insert-tasks.js'
import { insertAgentRun } from './insert-agent-run.js'
import { saveArtifactDependencies } from './save-artifact-dependencies.js'

export async function saveAgentOutput({
  workspaceContext,
  requiredArtifacts = [],
  agent,
  result,
  startedAt,
  completedAt
}) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const insertedArtifacts = await insertArtifacts(client, {
      workspaceContext,
      agent,
      artifacts: result.artifacts
    })

    await saveArtifactDependencies(client, {
      parentArtifacts: requiredArtifacts,
      childArtifacts: insertedArtifacts
    })

    await insertTasks(client, {
      workspaceContext,
      agent,
      tasks: result.tasks
    })

    await insertAgentRun(client, {
      workspaceContext,
      agent,
      result,
      startedAt,
      completedAt
    })

    await client.query('COMMIT')

    return {
      artifacts: insertedArtifacts
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
