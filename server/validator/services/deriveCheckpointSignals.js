/**
 * Derive checkpoint signals from quiz answers
 * using REAL option keys from questions.option_map
 *
 * Pure labeling. No scoring. No decisions.
 */

export async function deriveCheckpointSignals(client, quizId) {
  // Load answers with question + checkpoint context
  const { rows } = await client.query(
    `
    SELECT
      q.id AS question_id,
      q.checkpoint,
      a.selected_option
    FROM answers a
    JOIN questions q ON q.id = a.question_id
    WHERE a.quiz_id = $1
    `,
    [quizId]
  )

  if (!rows.length) {
    throw new Error(`No answers found for quiz_id=${quizId}`)
  }

  // Index answers by question_id
  const answerByQ = {}
  for (const r of rows) {
    answerByQ[r.question_id] = r.selected_option
  }

  const signals = {}

  /* ------------------------------------------------------------------ */
  /* CP1 — Problem Reality                                              */
  /* Q1, Q2, Q3, Q4                                                     */
  /* ------------------------------------------------------------------ */
  signals.CP1 = {
    problem_frequency: map(answerByQ[1], {
      RARE: 'rare',
      MONTHLY: 'occasional',
      WEEKLY: 'frequent',
      DAILY: 'frequent',
      UNSURE: 'rare'
    }),

    problem_impact: map(answerByQ[2], {
      NONE: 'none',
      MILD: 'mild',
      PRODUCTIVITY: 'serious',
      STRESS: 'serious',
      REVENUE: 'critical'
    }),

    problem_evidence: map(answerByQ[3], {
      ASSUMPTION: 'assumption',
      HEARD: 'heard',
      OBSERVED: 'observed',
      PERSONAL: 'personal'
    }),

    public_visibility: map(answerByQ[4], {
      NONE: 'none',
      RARE: 'rare',
      SOME: 'some',
      FREQUENT: 'frequent'
    })
  }

  /* ------------------------------------------------------------------ */
  /* CP2 — Urgency                                                      */
  /* Q5, Q6, Q7                                                         */
  /* ------------------------------------------------------------------ */
  signals.CP2 = {
    trigger_strength: map(answerByQ[5], {
      NONE: 'none',
      CONVENIENCE: 'soft',
      REPUTATION: 'hard',
      MONEY: 'hard',
      DEADLINE: 'hard'
    }),

    panic_moment: map(answerByQ[6], {
      NEVER: 'never',
      RARE: 'rare',
      SOMETIMES: 'sometimes',
      CLEAR: 'clear'
    }),

    delay_cost: map(answerByQ[7], {
      NONE: 'none',
      MINOR: 'minor',
      MODERATE: 'minor',
      COMPOUNDS: 'compounding'
    })
  }

  /* ------------------------------------------------------------------ */
  /* CP3 — Willingness to Pay (LOCK)                                    */
  /* Q8, Q9, Q10                                                        */
  /* ------------------------------------------------------------------ */
  signals.CP3 = {
    payment_history: map(answerByQ[8], {
      NEVER: 'none',
      FREE: 'none',
      INDIRECT: 'indirect',
      DIRECT: 'direct'
    }),

    buyer_clarity: map(answerByQ[9], {
      NONE: 'absent',
      UNCLEAR: 'unclear',
      APPROVAL: 'unclear',
      DECIDER: 'clear'
    }),

    workaround_cost: map(answerByQ[10], {
      NONE: 'none',
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high'
    })
  }

  /* ------------------------------------------------------------------ */
  /* CP4 — ICP Clarity                                                  */
  /* Q11, Q12, Q13                                                      */
  /* ------------------------------------------------------------------ */
  signals.CP4 = {
    icp_definition: map(answerByQ[11], {
      EVERYONE: 'everyone',
      BROAD: 'fuzzy',
      NARROW: 'fuzzy',
      CLEAR: 'clear'
    }),

    pain_uniformity: map(answerByQ[12], {
      UNCLEAR: 'varies',
      VARIES: 'varies',
      MOSTLY: 'similar',
      SAME: 'same'
    }),

    reachability: map(answerByQ[13], {
      UNKNOWN: 'hard',
      HARD: 'hard',
      SOME: 'reachable',
      EASY: 'reachable'
    })
  }

  /* ------------------------------------------------------------------ */
  /* CP5 — Differentiation                                              */
  /* Q14, Q15, Q16                                                      */
  /* ------------------------------------------------------------------ */
  signals.CP5 = {
    differentiation_type: map(answerByQ[14], {
      NONE: 'none',
      PARITY: 'feature_parity',
      POSITIONING: 'positioning_gap',
      NEGLECTED: 'neglected_angle'
    }),

    user_complaints: map(answerByQ[15], {
      NONE: 'none',
      MINOR: 'minor',
      SOME: 'some',
      STRONG: 'strong'
    }),

    competition_structure: map(answerByQ[16], {
      DOMINATED: 'dominated',
      FEW: 'few',
      FRAGMENTED: 'fragmented'
    })
  }

  /* ------------------------------------------------------------------ */
  /* CP6 — Distribution                                                 */
  /* Q17, Q18, Q19                                                      */
  /* ------------------------------------------------------------------ */
  signals.CP6 = {
    channel_known: map(answerByQ[17], {
      NONE: false,
      EXPERIMENTAL: false,
      MULTIPLE: true,
      PROVEN: true
    }),

    channel_cost: map(answerByQ[18], {
      UNKNOWN: 'unknown',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low'
    }),

    channel_control: map(answerByQ[19], {
      NONE: 'none',
      PLATFORM: 'none',
      PARTIAL: 'partial',
      DIRECT: 'direct'
    })
  }

  /* ------------------------------------------------------------------ */
  /* CP7 — Founder Capability                                           */
  /* Q20, Q21, Q22, Q23                                                  */
  /* ------------------------------------------------------------------ */
  signals.CP7 = {
    domain_experience: map(answerByQ[20], {
      NONE: 'none',
      LEARN: 'none',
      ADJACENT: 'adjacent',
      DEEP: 'deep'
    }),

    credibility: map(answerByQ[21], {
      NONE: 'none',
      WEAK: 'weak',
      SOME: 'weak',
      PROVEN: 'proven'
    }),

    execution_speed: map(answerByQ[22], {
      VERY_SLOW: 'very_slow',
      SLOW: 'slow',
      MODERATE: 'moderate',
      FAST: 'fast'
    }),

    unfair_advantage: map(answerByQ[23], {
      NONE: 'none',
      WEAK: 'weak',
      TEMP: 'temp',
      CLEAR: 'clear'
    })
  }

  /* ------------------------------------------------------------------ */
  /* CP8 — Execution Readiness                                          */
  /* Q24, Q25, Q26                                                      */
  /* ------------------------------------------------------------------ */
  signals.CP8 = {
    financial_buffer: map(answerByQ[24], {
      NONE: 'none',
      LIMITED: 'limited',
      COMFORTABLE: 'comfortable'
    }),

    time_runway: map(answerByQ[25], {
      SHORT: 'short',
      MID: 'mid',
      LONG: 'long'
    }),

    execution_preference: map(answerByQ[26], {
      SERVICE: 'service',
      NEUTRAL: 'neutral',
      PRODUCT: 'product'
    })
  }

  /* ------------------------------------------------------------------ */
  /* CP9 — Psychological Alignment                                      */
  /* Q27, Q28                                                           */
  /* ------------------------------------------------------------------ */
  signals.CP9 = {
    result_acceptance: map(answerByQ[27], {
      REJECTS: 'rejects',
      HESITATES: 'hesitates',
      ACCEPTS: 'accepts'
    }),

    emotional_state: map(answerByQ[28], {
      FEARFUL: 'fearful',
      UNSURE: 'unsure',
      EXCITED: 'excited'
    })
  }

  return signals
}

/* ------------------------------------------------------------------ */
/* Helper — strict mapping                                             */
/* ------------------------------------------------------------------ */
function map(option, table) {
  if (!(option in table)) {
    throw new Error(`Unmapped option encountered: ${option}`)
  }
  return table[option]
}
