export function useQuizState(checkpoint) {
  const quiz = ref(null)
  const questions = ref([])

  async function load() {
    const res = await $fetch(`/api/quiz/state?checkpoint=${checkpoint}`)
    quiz.value = res.quiz
    questions.value = res.questions
  }

  async function saveAnswer({ questionId, value }) {
    await $fetch('/api/quiz/answer', {
      method: 'POST',
      body: { questionId, value }
    })

    const q = questions.value.find(q => q.id === questionId)
    if (q) q.answer = value
  }

  onMounted(load)

  return { quiz, questions, saveAnswer }
}
