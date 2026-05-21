import { createError, eventHandler, readBody } from 'h3'
import { pool } from '../../db/index.js'
import { requireQuizAccess, getIdentity } from '../../utils/quizAccess'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const { quizId, title, content, tags } = body || {}

  if (!quizId || !String(content || '').trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quizId and content are required'
    })
  }

  const normalizedTags = Array.isArray(tags)
    ? tags.map((tag) => String(tag || '').trim()).filter(Boolean)
    : []

  const client = await pool.connect()

  try {
    await requireQuizAccess(client, event, quizId)
    const { userId } = getIdentity(event)

    const { rows } = await client.query(
      `
      INSERT INTO knowledge_base_notes (quiz_id, user_id, title, content, tags, source)
      VALUES ($1, $2, $3, $4, $5::jsonb, 'quick_capture')
      RETURNING id, quiz_id, title, content, tags, source, created_at, updated_at
      `,
      [quizId, userId, String(title || '').trim() || null, String(content).trim(), JSON.stringify(normalizedTags)]
    )

    return { ok: true, note: rows[0] }
  } finally {
    client.release()
  }
})
