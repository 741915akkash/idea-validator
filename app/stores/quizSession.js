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
    /**
     * Used ONLY when resuming or hydrating an existing quiz
     */
    setQuizId(id) {
      this.quizId = id

      if (import.meta.client) {
        localStorage.setItem('quiz_id', id)
      }
    },

    /**
     * 🔑 IMPORTANT
     * Used when user explicitly starts a NEW quiz.
     * This clears all old client-side state.
     */
    startFreshQuiz(id) {
      this.quizId = id
      this.isCompleted = false
      this.checkpoints = []
      this.loaded = false

      if (import.meta.client) {
        localStorage.setItem('quiz_id', id)
      }
    },

    async loadOverview(quizId) {
      // prevent unnecessary reloads
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

    async startRevision(completedQuizId) {
      const { quiz_id } = await $fetch('/api/quiz/create-revision', {
        method: 'POST',
        body: { quiz_id: completedQuizId }
      })

      // hard reset (important)
      this.startFreshQuiz(quiz_id)

      // let /quiz page handle loading
      navigateTo('/quiz')
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

    /**
     * Hydrate quiz from localStorage on page reload
     * ONLY if we don't already have one in memory
     */
    hydrate() {
      if (import.meta.client && !this.quizId) {
        const saved = localStorage.getItem('quiz_id')
        if (saved) {
          this.quizId = saved
        }
      }
    },

    /**
     * Hard reset (logout, debug, full wipe)
     */
    reset() {
      this.quizId = null
      this.isCompleted = false
      this.checkpoints = []
      this.loaded = false

      if (import.meta.client) {
        localStorage.removeItem('quiz_id')
      }
    }
  }
})
