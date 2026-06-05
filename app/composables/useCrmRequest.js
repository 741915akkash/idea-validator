import { useQuizSessionStore } from '~/stores/quizSession'

function getCrmFetch() {
  return import.meta.server ? useRequestFetch() : $fetch
}

async function resolveQuizId() {
  const quizStore = useQuizSessionStore()

  quizStore.hydrate()

  const quizId = String(quizStore.quizId || '').trim()

  if (!quizId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  if (!quizStore.currentWorkspaceId) {
    if (!quizStore.quizzes.length) {
      await quizStore.loadQuizzes()
    }

    const currentQuiz = quizStore.quizzes.find((q) => String(q.id) === quizId)
    if (currentQuiz?.workspace_id) {
      quizStore.setCurrentWorkspace({ id: currentQuiz.workspace_id })
    }
  }

  return quizId
}

/**
 * User-global CRM config fetch
 *
 * Used for:
 * - pipeline stages
 * - sources
 * - sequences
 *
 * Does NOT send quiz_id.
 */
export function crmGlobalFetch(url, options = {}) {
  const requestFetch = getCrmFetch()

  return requestFetch(url, options)
}

/**
 * Quiz-scoped CRM fetch
 *
 * Used for:
 * - leads
 * - activities
 *
 * Automatically injects quiz_id.
 */
export async function crmQuizFetch(url, options = {}) {
  const quizId = String(options.quizId || (await resolveQuizId())).trim()

  const method = String(options?.method || 'GET').toUpperCase()

  const requestFetch = getCrmFetch()

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
