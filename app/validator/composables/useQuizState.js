export function useQuizState(checkpoint) {
  const quiz = ref(null)
  const questions = ref([])

  async function load() {
    if (!checkpoint) return // guard
    const res = await $fetch(`/api/quiz/lifecycle/state?checkpoint=${checkpoint}`)
    quiz.value = res.quiz
    questions.value = res.questions
  }

  async function saveAnswer({ questionId, value }) {
    await $fetch('/api/quiz/answers/answer', {
      method: 'POST',
      body: { questionId, value }
    })

    const q = questions.value.find((q) => q.id === questionId)
    if (q) q.answer = value
  }

  return { quiz, questions, load, saveAnswer }
}
