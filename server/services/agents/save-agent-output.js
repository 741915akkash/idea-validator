import { pool } from '../../db/index.js'

export async function saveAgentOutput({ workspaceContext, agent, result, startedAt, completedAt }) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await insertArtifacts(client, {
      workspaceContext,
      agent,
      artifacts: result.artifacts
    })

    // Part 2
    await insertTasks(client, {
      workspaceContext,
      agent,
      tasks: result.tasks
    })

    // Part 2
    await insertAgentRun(client, {
      workspaceContext,
      agent,
      result,
      startedAt,
      completedAt
    })

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/* -------------------------------------------------------------------------- */
/*                                 INSERTS                                    */
/* -------------------------------------------------------------------------- */

async function insertArtifacts(client, { workspaceContext, agent, artifacts }) {
  if (!artifacts?.length) {
    return
  }

  const workspaceId = workspaceContext.workspace.id
  const quizId = workspaceContext.quiz.current?.id ?? null

  for (const artifact of artifacts) {
    await client.query(
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
        created_by
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
        NULL
      )
      `,
      [
        workspaceId,
        quizId,
        artifact.taskId ?? null,
        artifact.type,
        artifact.title ?? null,
        artifact.summary ?? null,
        artifact.content,
        agent.id
      ]
    )
  }
}

async function insertTasks(client, { workspaceContext, agent, tasks }) {
  if (!tasks?.length) {
    return
  }

  const workspaceId = workspaceContext.workspace.id

  for (const task of tasks) {
    await client.query(
      `
      INSERT INTO tasks (
        workspace_id,
        parent_task_id,
        title,
        description,
        status,
        priority,
        task_type,
        owner_type,
        owner_id,
        source_agent
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
        $9,
        $10
      )
      `,
      [
        workspaceId,
        task.parentTaskId ?? null,
        task.title,
        task.description ?? null,
        task.status ?? 'todo',
        task.priority ?? 'medium',
        task.taskType,
        task.ownerType ?? 'agent',
        task.ownerId ?? null,
        agent.id
      ]
    )
  }
}

async function insertAgentRun(client, { workspaceContext, agent, result, startedAt, completedAt }) {
  const inputSummary = {
    quizRevision: workspaceContext.quiz.current?.revisionNumber ?? null,
    artifactCount: workspaceContext.artifacts.length,
    interviewCount: workspaceContext.interviews.sessions.length,
    taskCount: workspaceContext.tasks.length
  }

  const outputSummary = {
    artifactsCreated: result.artifacts.length,
    tasksCreated: result.tasks.length,
    warnings: result.warnings?.length ?? 0,

    provider: result.run.provider,
    model: result.run.model,

    promptTokens: result.run.promptTokens,
    completionTokens: result.run.completionTokens,
    totalTokens: result.run.totalTokens,

    costUsd: result.run.costUsd
  }

  await client.query(
    `
    INSERT INTO agent_runs (
      workspace_id,
      agent_name,
      status,
      input_summary,
      output_summary,
      started_at,
      completed_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )
    `,
    [
      workspaceContext.workspace.id,
      agent.id,
      result.run.success ? 'completed' : 'failed',
      inputSummary,
      outputSummary,
      startedAt,
      completedAt
    ]
  )
}
