import { db } from '../../db/index.js'

export async function storeCache({
  level,
  input_text,
  normalized_text,
  structured_json,
  embedding
}) {
  const query = `
    INSERT INTO interview_cache
    (level, input_text, normalized_text, structured_json, embedding)
    VALUES ($1, $2, $3, $4, $5)
  `

  await db.query(query, [level, input_text, normalized_text, structured_json, embedding])
}

export async function incrementHit(id) {
  await db.query(
    `
    UPDATE interview_cache
    SET hit_count = hit_count + 1
    WHERE id = $1
  `,
    [id]
  )
}
