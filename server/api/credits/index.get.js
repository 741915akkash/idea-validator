import { eventHandler } from 'h3'
import { pool } from '../../db/index.js'
import { getCreditsSnapshot } from '../../db/queries/credits.js'

export default eventHandler(async (event) => {
  const user = event.context?.user || null

  if (!user) {
    return {
      authenticated: false,
      credits: null
    }
  }

  const client = await pool.connect()

  try {
    const credits = await getCreditsSnapshot({
      client,
      userId: user.id
    })

    return {
      authenticated: true,
      ...credits
    }
  } finally {
    client.release()
  }
})
