import { useQuizSessionStore } from '~/stores/quizSession'

function resolveQuizId() {
  const quizStore = useQuizSessionStore()
  quizStore.hydrate()
  const quizId = String(quizStore.quizId || '').trim()

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  return quizId
}

export function crmFetch(url, options = {}) {
  const quizId = resolveQuizId()
  const method = String(options?.method || 'GET').toUpperCase()

  if (method === 'GET') {
    return $fetch(url, {
      ...options,
      query: {
        ...(options.query || {}),
        quiz_id: quizId
      }
    })
  }

  return $fetch(url, {
    ...options,
    body: {
      ...(options.body || {}),
      quiz_id: quizId
    }
  })
}
