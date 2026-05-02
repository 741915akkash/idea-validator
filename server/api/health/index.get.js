import { eventHandler } from 'h3'
import { pool } from '../../db/index.js'

export default eventHandler(async () => {
  const start = Date.now()
  let client

  try {
    client = await pool.connect()

    // VERY light query
    await client.query('SELECT 1')

    return {
      status: 'ok',
      db: 'connected',
      latency: Date.now() - start
    }
  } catch (error) {
    console.error('Health check failed:', error)

    return {
      status: 'error',
      db: 'disconnected'
    }
  } finally {
    if (client) client.release()
  }
})
