export async function compressContext(context) {
  return {
    workspace: context.workspace,

    quiz: context.quiz,

    existingResearch: keepLatestResearch(context.existingResearch)
  }
}

function keepLatestResearch(research) {
  const MAX_RESEARCH_ARTIFACTS = 10

  return research
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_RESEARCH_ARTIFACTS)
}
