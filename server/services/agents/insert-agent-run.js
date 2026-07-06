export async function insertAgentRun(
  client,
  { workspaceContext, agent, result, startedAt, completedAt }
) {
  const inputSummary = {
    quizRevision: workspaceContext.quiz.current?.revisionNumber ?? null,
    artifactCount: workspaceContext.artifacts.all.length,
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
