import { pool } from '../../db/index.js'
import { toVectorLiteral } from './cache.js'

export async function findSimilar({ embedding, level }) {
  const vector = toVectorLiteral(embedding)

  const query = `
    SELECT
      id,
      structured_json,
      confidence_score,
      1 - (embedding <=> $1::vector) AS similarity
    FROM interview_cache
    WHERE level = $2
      AND confidence_score >= 75
    ORDER BY embedding <=> $1::vector
    LIMIT 1
  `

  const { rows } = await pool.query(query, [vector, level])

  if (!rows.length) {
    return null
  }

  return rows[0]
}
