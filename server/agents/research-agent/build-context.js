export async function buildContext(workspaceContext) {
  const existingResearch = workspaceContext.artifacts.filter((artifact) =>
    ['market-analysis', 'competitor-analysis', 'competitor', 'market', 'insight'].includes(
      artifact.type
    )
  )

  return {
    workspace: workspaceContext.workspace,

    quiz: {
      current: workspaceContext.quiz.current,
      quizAnswers: workspaceContext.quiz.quizAnswers,
      results: workspaceContext.quiz.results
    },

    existingResearch
  }
}
