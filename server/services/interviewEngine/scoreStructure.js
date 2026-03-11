// server/services/interviewEngine/scoreStructure.js

const bannedWords = ['why', 'feel', 'think', 'would', 'could', 'might']

export function scoreDecomposition(structured) {
  if (!structured?.sub_uncertainties) return 0

  const items = structured.sub_uncertainties
  let score = 100

  if (items.length < 4 || items.length > 6) score -= 40

  const unique = new Set(items)
  if (unique.size !== items.length) score -= 20

  for (const item of items) {
    if (!item || item.trim().length < 10) score -= 10

    for (const word of bannedWords) {
      if (item.toLowerCase().includes(word)) score -= 5
    }
  }

  return Math.max(0, score)
}

export function scoreGoalStructure(structured) {
  if (!structured?.conditions) return 0

  const conditions = structured.conditions
  let score = 100

  if (conditions.length < 5 || conditions.length > 7) score -= 40

  const seenConditions = new Set()

  for (const cond of conditions) {
    if (!cond.text || !cond.questions) score -= 10

    if (seenConditions.has(cond.text)) score -= 20
    seenConditions.add(cond.text)

    if (!cond.questions || cond.questions.length < 1 || cond.questions.length > 2) score -= 10

    for (const word of bannedWords) {
      if (cond.text.toLowerCase().includes(word)) score -= 5
    }
  }

  return Math.max(0, score)
}
