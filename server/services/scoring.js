export async function calculateScores(client, quizId) {
  const { rows } = await client.query(`
    SELECT
      q.checkpoint,
      q.option_map,
      a.selected_option
    FROM answers a
    JOIN questions q ON q.id = a.question_id
    WHERE a.quiz_id = $1
  `, [quizId]);

  const marketByCheckpoint = {};
  const confidenceByCheckpoint = {};

  let marketScore = 0;
  let confidenceScore = 0;

  for (const row of rows) {
    const scoreObj = row.option_map[row.selected_option];
    if (!scoreObj) continue;

    const m = scoreObj.market || 0;
    const c = scoreObj.confidence || 0;

    // Market score only CP 1–6
    if (row.checkpoint <= 6) {
      marketScore += m;
      marketByCheckpoint[row.checkpoint] =
        (marketByCheckpoint[row.checkpoint] || 0) + m;
    }

    // Confidence score CP 1–4 + 7–9
    if (row.checkpoint <= 4 || row.checkpoint >= 7) {
      confidenceScore += c;
      confidenceByCheckpoint[row.checkpoint] =
        (confidenceByCheckpoint[row.checkpoint] || 0) + c;
    }
  }

  // 🔒 HARD RULE — CP3 (Willingness to Pay)
  if ((marketByCheckpoint[3] || 0) < 10) {
    return {
      marketScore,
      confidenceScore: Math.min(confidenceScore, 100),
      decision: 'DO_NOT_BUILD',
      locked: true,
      breakdown: {
        marketByCheckpoint,
        confidenceByCheckpoint
      }
    };
  }

  // 🎯 Market-based decision
  let decision = 'REFINE';
  if (marketScore >= 70) decision = 'BUILD';
  if (marketScore < 40) decision = 'DO_NOT_BUILD';

  return {
    marketScore,
    confidenceScore: Math.min(confidenceScore, 100),
    decision,
    locked: false,
    breakdown: {
      marketByCheckpoint,
      confidenceByCheckpoint
    }
  };
}
