export function useQuizNavigation() {
  async function startOrResumeQuiz() {
    const res = await $fetch('/api/quiz/start')
    navigateTo(`/quiz/${res.nextCheckpoint}`)
  }

  return { startOrResumeQuiz }
}
