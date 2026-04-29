import { pool } from '../../db/index.js'

export function toVectorLiteral(embedding) {
  return `[${embedding.join(',')}]`
}

export async function storeCache({
  level,
  input_text,
  normalized_text,
  structured_json,
  embedding,
  confidence_score
}) {
  const vector = toVectorLiteral(embedding)

  const query = `
    INSERT INTO interview_cache
    (level, input_text, normalized_text, structured_json, embedding, confidence_score)
    VALUES ($1, $2, $3, $4, $5::vector, $6)
  `

  await pool.query(query, [
    level,
    input_text,
    normalized_text,
    structured_json,
    vector,
    confidence_score
  ])
}

export async function incrementHit(id) {
  await pool.query(
    `
    UPDATE interview_cache
    SET hit_count = hit_count + 1
    WHERE id = $1
    `,
    [id]
  )
}
