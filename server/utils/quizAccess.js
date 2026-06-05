import { createError } from 'h3'

export function getIdentity(event) {
  const userId = event.context?.user?.id || event.context?.auth?.userId || null
  const visitorId = event.context?.visitorId || null
  return { userId, visitorId }
}

export function requireIdentity(event) {
  const identity = getIdentity(event)

  if (!identity.userId && !identity.visitorId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  return identity
}

export function requireUserIdentity(event) {
  const { userId } = getIdentity(event)

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Login required'
    })
  }

  return { userId }
}

export async function requireWorkspaceAccess(client, event, workspaceId, options = {}) {
  if (!workspaceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'workspace_id required'
    })
  }

  const { select = 'id, name, user_id' } = options
  const { userId } = requireUserIdentity(event)

  const { rows } = await client.query(
    `
    SELECT ${select}
    FROM workspaces
    WHERE id = $1
      AND user_id = $2
    LIMIT 1
    `,
    [workspaceId, userId]
  )

  if (!rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Workspace not found'
    })
  }

  return rows[0]
}

export async function requireQuizAccess(client, event, quizId, options = {}) {
  if (!quizId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  const {
    select = 'id, user_id, visitor_id, workspace_id',
    includeArchived = false,
    workspaceId = null
  } = options
  const { userId, visitorId } = requireIdentity(event)

  if (workspaceId) {
    const { rows } = await client.query(
      `
      SELECT ${select}
      FROM quizzes
      WHERE id = $1
        AND workspace_id = $2
        ${includeArchived ? '' : 'AND archived_at IS NULL'}
      LIMIT 1
      `,
      [quizId, workspaceId]
    )

    if (!rows.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Quiz not found'
      })
    }

    return rows[0]
  }

  let query
  let params

  if (userId) {
    query = `
      SELECT ${select}
      FROM quizzes
      WHERE id = $1
        AND user_id = $2
        ${includeArchived ? '' : 'AND archived_at IS NULL'}
      LIMIT 1
    `
    params = [quizId, userId]
  } else {
    query = `
      SELECT ${select}
      FROM quizzes
      WHERE id = $1
        AND visitor_id = $2
        ${includeArchived ? '' : 'AND archived_at IS NULL'}
      LIMIT 1
    `
    params = [quizId, visitorId]
  }

  const { rows } = await client.query(query, params)

  if (!rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Quiz not found'
    })
  }

  return rows[0]
}

export async function requireWorkspaceQuizAccess(client, event, quizId, workspaceId, options = {}) {
  if (!workspaceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'workspace_id required'
    })
  }

  await requireWorkspaceAccess(client, event, workspaceId)

  return requireQuizAccess(client, event, quizId, {
    ...options,
    workspaceId
  })
}
