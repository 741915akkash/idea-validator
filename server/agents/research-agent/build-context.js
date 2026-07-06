export async function buildContext(workspaceContext) {
  return {
    workspace: workspaceContext.workspace,

    quiz: {
      current: workspaceContext.quiz.current,
      quizAnswers: workspaceContext.quiz.quizAnswers,
      results: workspaceContext.quiz.results
    },

    existingResearch: workspaceContext.artifacts.required
  }
}
