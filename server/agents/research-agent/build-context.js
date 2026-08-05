export async function buildContext(agentContext) {
  return {
    workspace: agentContext.workspace,

    quiz: {
      current: agentContext.quiz.current,
      quizAnswers: agentContext.quiz.quizAnswers,
      results: agentContext.quiz.results
    },

    existingResearch: agentContext.requiredArtifacts
  }
}
