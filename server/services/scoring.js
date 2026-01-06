export async function calculateScores(client, quizId) {
  const { rows } = await client.query(
    `
    SELECT
      q.checkpoint,
      q.option_map,
      a.selected_option
    FROM answers a
    JOIN questions q ON q.id = a.question_id
    WHERE a.quiz_id = $1
  `,
    [quizId]
  )

  /* ----------------------------
   * MARKET SCORE (CP 1–6)
   * ---------------------------- */
  const marketByCheckpoint = {}
  let marketScore = 0

  /* ----------------------------
   * CONFIDENCE RAW BUCKETS
   * ---------------------------- */
  let evidenceCp1 = 0
  let evidenceCp3 = 0

  let urgencyScore = 0

  // Consistency uses MARKET signal as proxy for coherence
  const consistencyBuckets = {
    1: { score: 0, max: 20 }, // FIXED
    2: { score: 0, max: 17 },
    3: { score: 0, max: 20 },
    4: { score: 0, max: 15 }
  }

  let founderLeverage = 0
  let executionReadiness = 0
  let finalAcceptance = 0

  /* ----------------------------
   * ITERATE ANSWERS
   * ---------------------------- */
  for (const row of rows) {
    const scoreObj = row.option_map[row.selected_option]
    if (!scoreObj) continue

    const m = scoreObj.market || 0
    const c = scoreObj.confidence || 0

    if (row.checkpoint <= 6) {
      marketScore += m
      marketByCheckpoint[row.checkpoint] = (marketByCheckpoint[row.checkpoint] || 0) + m
    }

    if (row.checkpoint === 1) evidenceCp1 += m
    if (row.checkpoint === 3) evidenceCp3 += m

    if (row.checkpoint === 2) urgencyScore += m

    if (row.checkpoint >= 1 && row.checkpoint <= 4) {
      consistencyBuckets[row.checkpoint].score += m
    }

    if (row.checkpoint === 7) founderLeverage += c
    if (row.checkpoint === 8) executionReadiness += c
    if (row.checkpoint === 9) finalAcceptance += c
  }

  /* ----------------------------
   * CONFIDENCE DIMENSIONS
   * ---------------------------- */
  let evidenceScore = Math.min(evidenceCp1 * 3 + evidenceCp3 * 2, 25)

  urgencyScore = Math.min(urgencyScore, 15)

  const consistencyPercents = Object.values(consistencyBuckets).map((cp) => cp.score / cp.max)

  const consistencyScore = consistencyPercents.every((p) => p >= 0.6)
    ? 25
    : Math.round((consistencyPercents.reduce((a, b) => a + b, 0) / consistencyPercents.length) * 25)

  founderLeverage = Math.min(founderLeverage, 25)
  executionReadiness = Math.min(executionReadiness, 15)
  finalAcceptance = Math.min(finalAcceptance, 20)

  let confidenceScore = Math.min(
    evidenceScore +
      urgencyScore +
      consistencyScore +
      founderLeverage +
      executionReadiness +
      finalAcceptance,
    100
  )

  /* ----------------------------
   * HARD LOCK — WILLINGNESS TO PAY
   * ---------------------------- */
  const wtpTooLow = (marketByCheckpoint[3] || 0) < 10

  let marketDecision = 'REFINE'
  if (marketScore >= 70) marketDecision = 'BUILD'
  if (marketScore < 40) marketDecision = 'DO_NOT_BUILD'
  if (wtpTooLow) marketDecision = 'DO_NOT_BUILD'

  /* ----------------------------
   * RETURN SNAPSHOT
   * ---------------------------- */
  return {
    marketScore,
    confidenceScore,
    decision: marketDecision,
    locked: wtpTooLow,
    lock_reason: wtpTooLow ? 'Willingness to pay too low' : null,
    summary: {
      market_decision: marketDecision,
      market_breakdown: marketByCheckpoint,
      confidence_breakdown: {
        evidence: evidenceScore,
        urgency: urgencyScore,
        consistency: consistencyScore,
        founder_leverage: founderLeverage,
        execution_readiness: executionReadiness,
        final_acceptance: finalAcceptance
      }
    }
  }

}
