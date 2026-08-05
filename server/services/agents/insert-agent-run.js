export async function insertAgentRun(
  client,
  { workspaceContext, agent, result, startedAt, completedAt }
) {
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

    provider: result.run.llm.provider,
    model: result.run.llm.model,

    llmCalls: result.run.llm.calls,
    toolCalls: result.run.tools.calls,

    promptTokens: result.run.llm.promptTokens,
    completionTokens: result.run.llm.completionTokens,
    totalTokens: result.run.llm.totalTokens,

    latencyMs: result.run.llm.latencyMs,

    costUsd: result.run.llm.costUsd
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
