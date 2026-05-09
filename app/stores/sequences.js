import { defineStore } from 'pinia'
import { useQuizSessionStore } from './quizSession'

function apiFetch(url, options = {}) {
  const requestFetch = import.meta.server ? useRequestFetch() : $fetch
  const quizStore = useQuizSessionStore()
  const quizId = String(quizStore.quizId || '').trim()
  const method = String(options?.method || 'GET').toUpperCase()

  if (method === 'GET') {
    return requestFetch(url, {
      ...options,
      query: {
        ...(options.query || {}),
        quiz_id: quizId
      }
    })
  }

  return requestFetch(url, {
    ...options,
    body: {
      ...(options.body || {}),
      quiz_id: quizId
    }
  })
}

function normalizeSequence(sequence) {
  const steps = Array.isArray(sequence?.steps)
    ? sequence.steps.map((step, index) => ({
        id: step.id,
        step_number: Number(step.step_number ?? index + 1),
        type: step.type || 'call',
        title: step.title || '',
        description: step.description || '',
        offset: Number(step.offset ?? step.offset_days ?? 0)
      }))
    : []

  return {
    id: sequence?.id ?? null,
    title: sequence?.title ?? '',
    created_at: sequence?.created_at ?? null,
    updated_at: sequence?.updated_at ?? null,
    steps
  }
}

function normalizePayload(sequence) {
  return {
    id: sequence?.id,
    title: String(sequence?.title || '').trim(),
    steps: Array.isArray(sequence?.steps)
      ? sequence.steps.map((step) => ({
          type: step?.type || 'call',
          title: String(step?.title || '').trim(),
          description: String(step?.description || '').trim(),
          offset: Number(step?.offset ?? 0)
        }))
      : []
  }
}

export const useSequencesStore = defineStore('sequences', {
  state: () => ({
    sequences: []
  }),

  actions: {
    setSequences(data) {
      this.sequences = Array.isArray(data) ? data.map(normalizeSequence) : []
    },

    upsertSequence(sequence) {
      const normalized = normalizeSequence(sequence)
      const index = this.sequences.findIndex((item) => item.id === normalized.id)

      if (index === -1) {
        this.sequences = [normalized, ...this.sequences]
        return
      }

      const next = [...this.sequences]
      next[index] = normalized
      this.sequences = next
    },

    async fetchSequences() {
      const data = await apiFetch('/api/crm/sequences')
      this.setSequences(data)
      return this.sequences
    },

    async fetchSequenceById(id) {
      const data = await apiFetch('/api/crm/sequences/by-id', {
        query: { id }
      })

      this.upsertSequence(data)
      return normalizeSequence(data)
    },

    async addSequence(sequence) {
      const tempId = `tmp-${Date.now()}`
      const optimistic = normalizeSequence({
        ...sequence,
        id: tempId
      })
      this.sequences = [optimistic, ...this.sequences]

      try {
        const created = await apiFetch('/api/crm/sequences/create', {
          method: 'POST',
          body: normalizePayload(sequence)
        })

        this.sequences = this.sequences.filter((item) => item.id !== tempId)
        this.upsertSequence(created)
        return created
      } catch (error) {
        this.sequences = this.sequences.filter((item) => item.id !== tempId)
        throw error
      }
    },

    async updateSequence(sequence) {
      const existingIndex = this.sequences.findIndex((item) => item.id === sequence?.id)
      const previous = existingIndex !== -1 ? this.sequences[existingIndex] : null

      if (existingIndex !== -1) {
        const next = [...this.sequences]
        next[existingIndex] = normalizeSequence(sequence)
        this.sequences = next
      }

      try {
        const updated = await apiFetch('/api/crm/sequences/update', {
          method: 'PATCH',
          body: normalizePayload(sequence)
        })

        this.upsertSequence(updated)
        return updated
      } catch (error) {
        if (existingIndex !== -1 && previous) {
          const rollback = [...this.sequences]
          const currentIndex = rollback.findIndex((item) => item.id === sequence?.id)
          if (currentIndex !== -1) {
            rollback[currentIndex] = previous
          } else {
            rollback.splice(existingIndex, 0, previous)
          }
          this.sequences = rollback
        }
        throw error
      }
    },

    async deleteSequence(id) {
      const previous = [...this.sequences]
      this.sequences = this.sequences.filter((item) => item.id !== id)

      try {
        await apiFetch('/api/crm/sequences/delete', {
          method: 'DELETE',
          body: { id }
        })
      } catch (error) {
        this.sequences = previous
        throw error
      }
    }
  }
})
