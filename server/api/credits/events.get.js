import { eventHandler, getQuery } from 'h3'
import { pool } from '../../db/index.js'
import { getCreditEvents } from '../../db/queries/credits.js'

export default eventHandler(async (event) => {
  const user = event.context?.user || null

  if (!user) {
    return {
      authenticated: false,
      events: []
    }
  }

  const query = getQuery(event)
  const limit = query.limit == null ? 50 : Number(query.limit)

  const client = await pool.connect()

  try {
    const events = await getCreditEvents({
      client,
      userId: user.id,
      limit
    })

    return {
      authenticated: true,
      events
    }
  } finally {
    client.release()
  }
})
