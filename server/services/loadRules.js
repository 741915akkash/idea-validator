import { pool } from '../db'

export async function loadRules() {
  const { rows } = await pool.query(`
    SELECT
      id,
      section,
      checkpoint,
      priority,
      conditions,
      copy,
      active
    FROM rules
    WHERE active = true
  `)

  return rows
}
