// app/stores/interviewSession.js

import { defineStore } from 'pinia'

export const useInterviewSession = defineStore('interviewSession', {
  state: () => ({
    // Context
    quizId: null,

    // Execution identity
    interviewId: null,
    respondentName: '',

    // Phase control
    // 'uncertainty' | 'goal' | 'resolve' | 'complete'
    phase: 'uncertainty',

    // Template structure
    uncertainty: null,
    subUncertainties: [],
    selectedSub: null,
    goal: null,
    conditions: [],
    interviewQuestions: [],

    // Runtime state
    conditionResults: [],
    evidenceEntries: [],

    // UI state
    activeConditionIndex: 0,
    disableGoalPrevious: false,

    // Outcome
    completionStatus: null // 'met' | 'not_met'
  }),

  getters: {
    questions(state) {
      return state.interviewQuestions
    },

    

    currentCondition(state) {
      if (state.phase !== 'resolve') return null
      return state.conditions[state.activeConditionIndex] || null
    },

    totalConditions(state) {
      return state.conditions.length
    },

    resolvedCount(state) {
      return state.conditions.filter((c) => c.status !== 'pending').length
    },

    progressPercent(state) {
      if (!state.conditions.length) return 0
      return Math.round((state.resolvedCount / state.conditions.length) * 100)
    },

    isAllConditionsResolved(state) {
      return state.conditions.length > 0 && state.conditions.every((c) => c.status !== 'pending')
    },

    canGoPrevious(state) {
      return ['goal', 'resolve', 'complete'].includes(state.phase)
    }
  },

  actions: {
    startNewInterviewSession({ quizId, disableGoalPrevious = false }) {
      this.$reset()
      this.quizId = quizId || null
      this.phase = 'uncertainty'
      this.disableGoalPrevious = Boolean(disableGoalPrevious)
    },

    // 🔁 RESET
    resetSession() {
      this.$reset()
    },

    // 🟢 After creating uncertainty
    setUncertainty({ uncertainty, subUncertainties }) {
      this.uncertainty = uncertainty
      this.subUncertainties = subUncertainties
      this.selectedSub = null
      this.goal = null
      this.conditions = []
      this.interviewQuestions = []
      this.phase = 'uncertainty'
    },

    resetDecomposition() {
      this.subUncertainties = []
      this.selectedSub = null
    },

    selectSub(sub) {
      this.selectedSub = sub
      this.phase = 'goal'
    },

    setGoalDraft({ selectedSub, goal, conditions, questions = [] }) {
      this.selectedSub = selectedSub
      this.goal = goal
      this.conditions = (conditions || []).map((condition) => ({
        ...condition,
        status: condition.status || 'pending'
      }))
      this.interviewQuestions = questions
      this.phase = 'goal'
    },

    setGoalStructure({ goal, conditions, questions }) {
      this.goal = goal
      this.conditions = conditions
      this.interviewQuestions = questions
      this.phase = 'resolve'
    },

    goToPreviousPhase() {
      if (this.phase === 'goal') {
        this.phase = 'uncertainty'
        return
      }

      if (this.phase === 'resolve') {
        this.phase = 'goal'
        return
      }

      if (this.phase === 'complete') {
        this.phase = 'resolve'
      }
    },

    goToNextPhase() {
      if (this.phase === 'uncertainty') {
        this.phase = 'goal'
        return
      }

      if (this.phase === 'goal') {
        this.phase = 'resolve'
        return
      }

      if (this.phase === 'resolve') {
        this.phase = 'complete'
      }
    },

    // 🟢 Initialize full interview execution
    initializeInterview(payload) {
      const {
        interview,
        sub_uncertainty,
        goal,
        conditions,
        questions,
        condition_results,
        evidence_entries
      } = payload

      this.interviewId = interview.id
      this.quizId = interview.quiz_id || this.quizId
      this.respondentName = interview.respondent_info || ''
      this.selectedSub = sub_uncertainty
      this.goal = goal
      this.interviewQuestions = questions || []
      this.conditionResults = condition_results || []
      this.evidenceEntries = evidence_entries || []
      this.completionStatus = interview.completion_status

      // Merge template + runtime
      const results = condition_results || []

      this.conditions = (conditions || []).map((cond) => {
        const result = results.find((r) => r.condition_id === cond.id)
        return {
          ...cond,
          status: result?.status || 'pending'
        }
      })

      this.activeConditionIndex = this.conditions.findIndex((c) => c.status === 'pending')

      if (this.activeConditionIndex === -1) {
        this.phase = 'complete'
      } else {
        this.phase = 'resolve'
      }
    },

    // 🟢 Update condition locally after backend success
    resolveCondition({ conditionId, status }) {
      const index = this.conditions.findIndex((c) => c.id === conditionId)
      if (index === -1) return

      this.conditions[index].status = status

      const nextIndex = this.conditions.findIndex((c) => c.status === 'pending')

      if (nextIndex !== -1) {
        this.activeConditionIndex = nextIndex
      } else {
        // Keep user in resolve phase so they can freely revisit/edit conditions.
        this.activeConditionIndex = index
      }
    },

    jumpToCondition(index) {
      if (this.phase !== 'resolve') return
      if (!Number.isInteger(index)) return
      if (index < 0 || index >= this.conditions.length) return

      this.activeConditionIndex = index
    },

    // 🟢 Add evidence locally
    addEvidenceLocally(evidence) {
      const index = this.evidenceEntries.findIndex(
        (entry) =>
          (evidence.id && entry.id === evidence.id) ||
          String(entry.condition_id) === String(evidence.condition_id)
      )

      if (index === -1) {
        this.evidenceEntries.push(evidence)
        return
      }

      this.evidenceEntries[index] = {
        ...this.evidenceEntries[index],
        ...evidence
      }
    },

    async saveRespondent() {
      if (!this.interviewId) return

      await $fetch('/api/interview/update-respondent', {
        method: 'POST',
        body: {
          interview_id: this.interviewId,
          respondent_info: this.respondentName
        }
      })
    }
  }
})
