import { db } from '../../db/index.js'

export async function findSimilar({ embedding, level }) {
  const query = `
    SELECT
      id,
      structured_json,
      1 - (embedding <=> $1) AS similarity
    FROM interview_cache
    WHERE level = $2
    ORDER BY embedding <=> $1
    LIMIT 1
  `

  const { rows } = await db.query(query, [embedding, level])

  if (!rows.length) {
    return null
  }

  return rows[0]
}
