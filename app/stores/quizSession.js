import { defineStore } from 'pinia'

export const useQuizSessionStore = defineStore('quizSession', {
  state: () => ({
    quizId: null,
    isCompleted: false,

    // Array of:
    // { checkpoint: number, total: number, unanswered: number }
    checkpoints: [],

    loaded: false
  }),

  getters: {
    hasQuiz(state) {
      return !!state.quizId
    },

    isFullyAnswered(state) {
      return state.checkpoints.every((c) => c.unanswered === 0)
    },

    getCheckpoint(state) {
      return (checkpointNumber) => state.checkpoints.find((c) => c.checkpoint === checkpointNumber)
    }
  },

  actions: {
    setQuizId(id) {
      this.quizId = id
    },

    async loadOverview(quizId) {
      if (this.loaded && this.quizId === quizId) return

      const res = await $fetch('/api/quiz/overview', {
        query: { quiz_id: quizId }
      })

      this.quizId = quizId
      this.isCompleted = res.is_completed

      this.checkpoints = res.checkpoints.map((c) => ({
        checkpoint: c.checkpoint,
        total: c.total_questions,
        unanswered: c.unanswered_questions
      }))

      this.loaded = true
    },

    // Called after an answer is saved successfully
    decrementUnanswered(checkpointNumber) {
      const cp = this.getCheckpoint(checkpointNumber)
      if (!cp) return
      if (cp.unanswered > 0) cp.unanswered--
    },

    // Called when backend marks checkpoint complete
    markCheckpointComplete(checkpointNumber) {
      const cp = this.getCheckpoint(checkpointNumber)
      if (!cp) return
      cp.unanswered = 0
    },

    // Called when quiz is finalized
    markQuizCompleted() {
      this.isCompleted = true
    },

    reset() {
      this.quizId = null
      this.isCompleted = false
      this.checkpoints = []
      this.loaded = false
    }
  }
})
