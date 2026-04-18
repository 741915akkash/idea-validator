// app/composables/useInterviewApi.js

export function useInterviewApi() {
  async function request(url, options = {}) {
    try {
      return await $fetch(`/api${url}`, {
        ...options,
        credentials: 'include'
      })
    } catch (err) {
      throw new Error(err?.data?.message || err?.message || 'Interview API failed')
    }
  }

  // 1️⃣ Generate sub-uncertainties (non-persistent)
  async function generateSubUncertainties({ text }) {
    return await request('/uncertainty/generate', {
      method: 'POST',
      body: { text }
    })
  }

  // 2️⃣ Create uncertainty + persist sub-uncertainties
  async function createUncertainty({ quizId, text, subUncertainties }) {
    return await request('/uncertainty/create', {
      method: 'POST',
      body: { quiz_id: quizId, text, sub_uncertainties: subUncertainties }
    })
  }

  // 3️⃣ Create structure for sub (goal + conditions + questions)
  async function createStructure({ subUncertaintyId, goal }) {
    return await request('/sub_uncertainty/structure', {
      method: 'POST',
      body: {
        sub_uncertainty_id: subUncertaintyId,
        goal
      }
    })
  }

  // 4️⃣ Start interview execution
  async function startInterview({ quizId, subUncertaintyId }) {
    return await request('/interview/start', {
      method: 'POST',
      body: {
        quiz_id: quizId,
        sub_uncertainty_id: subUncertaintyId
      }
    })
  }

  // 5️⃣ Fetch interview execution
  async function fetchInterview({ interviewId }) {
    return await request(`/interview/get?interview_id=${interviewId}`, {
      method: 'GET'
    })
  }

  // 6️⃣ Update condition result
  async function updateCondition({ interviewId, conditionId, status }) {
    return await request('/interview/condition/update', {
      method: 'POST',
      body: {
        interview_id: interviewId,
        condition_id: conditionId,
        status
      }
    })
  }

  // 7️⃣ Upsert autosaved evidence draft (notes + evidence log)
  async function upsertEvidence(payload) {
    return await request('/evidence/upsert', {
      method: 'POST',
      body: payload
    })
  }

  return {
    generateSubUncertainties,
    createUncertainty,
    createStructure,
    startInterview,
    fetchInterview,
    updateCondition,
    upsertEvidence
  }
}
