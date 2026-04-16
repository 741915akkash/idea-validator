import { eventHandler } from 'h3'
import { pool } from '../../db/index.js'
import { getUsageSummary } from '../../utils/usageSummary.js'

export default eventHandler(async (event) => {
  const user = event.context?.user || null

  if (!user) {
    return {
      authenticated: false,
      usage: null
    }
  }

  const client = await pool.connect()

  try {
    const usage = await getUsageSummary({ user, client })
    return {
      authenticated: true,
      usage
    }
  } finally {
    client.release()
  }
})
