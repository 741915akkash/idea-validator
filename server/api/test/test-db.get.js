import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export default defineEventHandler(async () => {
  try {
    const res = await pool.query('SELECT NOW()')
    return {
      ok: true,
      time: res.rows[0]
    }
  } catch (err) {
    console.error('DB ERROR:', err)
    return {
      ok: false,
      error: err.message
    }
  }
})
