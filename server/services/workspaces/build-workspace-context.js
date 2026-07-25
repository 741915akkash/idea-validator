import { pool } from '../../db/index.js'

export async function buildWorkspaceContext({ workspaceId, context={} }) {
  if (!workspaceId) {
    throw new Error('workspaceId is required')
  }

  const client = await pool.connect()

  try {
    const workspace = await loadWorkspace(client, workspaceId)

    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`)
    }

    const currentQuiz = await loadCurrentQuiz(client, workspaceId)

    let quiz = {
      current: null,
      quizAnswers: [],
      results: null
    }

    if (currentQuiz) {
      const quizAnswers = await loadQuizAnswers(client, currentQuiz.id)
      const results = await loadQuizResults(client, currentQuiz.id)

      quiz = {
        current: currentQuiz,
        quizAnswers,
        results
      }
    }

    const artifacts = await loadArtifacts(client, workspaceId)
    const tasks = await loadTasks(client, workspaceId)
    const interviews = await loadInterviewSessions(client, workspaceId)

    return {
      workspace,
      quiz,
      artifacts,
      interviews,
      tasks,
      context
    }
  } finally {
    client.release()
  }
}

/* -------------------------------------------------------------------------- */
/*                                  LOADERS                                   */
/* -------------------------------------------------------------------------- */

async function loadWorkspace(client, workspaceId) {
  const { rows } = await client.query(
    `
    SELECT
      id,
      name,
      description,
      status,
      created_at,
      updated_at
    FROM workspaces
    WHERE id = $1
    LIMIT 1
    `,
    [workspaceId]
  )

  if (rows.length === 0) {
    return null
  }

  const row = rows[0]

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function loadCurrentQuiz(client, workspaceId) {
  const { rows } = await client.query(
    `
    SELECT
      id,
      name,
      revision_number,
      status,
      started_at,
      completed_at
    FROM quizzes
    WHERE workspace_id = $1
      AND archived_at IS NULL
    ORDER BY
      revision_number DESC,
      started_at DESC
    LIMIT 1
    `,
    [workspaceId]
  )

  if (rows.length === 0) {
    return null
  }

  const row = rows[0]

  return {
    id: row.id,
    name: row.name,
    revisionNumber: row.revision_number,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at
  }
}

async function loadQuizResults(client, quizId) {
  const { rows } = await client.query(
    `
    SELECT
      market_score,
      confidence_score,
      decision,
      summary
    FROM quiz_results
    WHERE quiz_id = $1
    LIMIT 1
    `,
    [quizId]
  )

  if (rows.length === 0) {
    return null
  }

  const row = rows[0]

  return {
    marketScore: row.market_score,
    confidenceScore: row.confidence_score,
    decision: row.decision,
    summary: row.summary
  }
}

async function loadQuizAnswers(client, quizId) {
  const { rows } = await client.query(
    `
    SELECT
      q.id,
      q.checkpoint,
      q.question_order,
      q.question_text,
      q.option_map,
      q.critical,
      a.selected_option
    FROM answers a
    INNER JOIN questions q
      ON q.id = a.question_id
    WHERE a.quiz_id = $1
    ORDER BY
      q.checkpoint,
      q.question_order
    `,
    [quizId]
  )

  return rows.map((row) => {
    const option = row.option_map[row.selected_option]

    return {
      questionId: row.id,
      checkpoint: row.checkpoint,
      order: row.question_order,
      question: row.question_text,
      answer: option?.label ?? row.selected_option,
      critical: row.critical
    }
  })
}

async function loadArtifacts(client, workspaceId) {
  const { rows } = await client.query(
    `
    SELECT
      id,
      type,
      title,
      summary,
      content_json,
      source_agent,
      status,
      revision_number,
      superseded_by,
      approved_by,
      approved_at,
      created_at
    FROM artifacts
    WHERE workspace_id = $1
    ORDER BY
      type ASC,
      revision_number DESC,
      created_at DESC
    `,
    [workspaceId]
  )

  // Group all revisions by artifact type.
  //
  // Example:
  //
  // market_analysis
  //   Rev 3 Draft
  //   Rev 2 Approved
  //
  // customer_persona
  //   Rev 2 Approved
  //   Rev 1 Draft
  //
  const grouped = new Map()

  for (const row of rows) {
    if (!grouped.has(row.type)) {
      grouped.set(row.type, [])
    }

    grouped.get(row.type).push(row)
  }

  const artifacts = []

  // Resolve one artifact per type.
  //
  // Resolution policy:
  //
  // 1. Use the latest approved revision.
  // 2. If none exists, use the latest draft.
  //
  // This allows new workspaces (which only have drafts)
  // to continue functioning while ensuring approved
  // knowledge always takes precedence.
  for (const revisions of grouped.values()) {
    const approved = revisions.find((artifact) => artifact.status === 'approved')

    const draft = revisions.find((artifact) => artifact.status === 'draft')

    const row = approved ?? draft

    if (!row) {
      continue
    }

    artifacts.push({
      id: row.id,
      type: row.type,
      title: row.title,
      summary: row.summary,
      content: row.content_json,
      sourceAgent: row.source_agent,

      status: row.status,
      revisionNumber: row.revision_number,
      supersededBy: row.superseded_by,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,

      createdAt: row.created_at
    })
  }

  return artifacts
}

async function loadTasks(client, workspaceId) {
  const { rows } = await client.query(
    `
    SELECT
      id,
      parent_task_id,
      title,
      description,
      status,
      priority,
      task_type,
      owner_type,
      owner_id,
      source_agent,
      created_at
    FROM tasks
    WHERE workspace_id = $1
    ORDER BY created_at DESC
    `,
    [workspaceId]
  )

  return rows.map((row) => ({
    id: row.id,
    parentTaskId: row.parent_task_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    taskType: row.task_type,
    ownerType: row.owner_type,
    ownerId: row.owner_id,
    sourceAgent: row.source_agent,
    createdAt: row.created_at
  }))
}

async function loadInterviewSessions(client, workspaceId) {
  const { rows } = await client.query(
    `
    SELECT
      i.id,
      i.name,
      i.respondent_info,
      i.status,
      i.started_at,
      i.finished_at,
      i.confidence_before,
      i.confidence_after,

      e.id AS evidence_id,
      e.respondent_name,
      e.notes,
      e.structured_responses,
      e.evidence_log,
      e.created_at AS evidence_created_at

    FROM interviews i

    INNER JOIN quizzes q
      ON q.id = i.quiz_id

    LEFT JOIN evidence_entries e
      ON e.interview_id = i.id

    WHERE q.workspace_id = $1

    ORDER BY
      i.started_at DESC,
      e.created_at ASC
    `,
    [workspaceId]
  )

  const sessions = new Map()

  for (const row of rows) {
    if (!sessions.has(row.id)) {
      sessions.set(row.id, {
        id: row.id,
        name: row.name,
        respondentInfo: row.respondent_info,
        status: row.status,
        startedAt: row.started_at,
        finishedAt: row.finished_at,
        confidenceBefore: row.confidence_before,
        confidenceAfter: row.confidence_after,
        evidence: []
      })
    }

    if (row.evidence_id) {
      sessions.get(row.id).evidence.push({
        id: row.evidence_id,
        respondentName: row.respondent_name,
        notes: row.notes,
        structuredResponses: row.structured_responses,
        evidenceLog: row.evidence_log,
        createdAt: row.evidence_created_at
      })
    }
  }

  return {
    sessions: Array.from(sessions.values())
  }
}
