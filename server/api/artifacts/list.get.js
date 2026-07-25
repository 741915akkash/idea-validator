import { pool } from '../../../db/index.js'
import { buildWorkspaceContext } from '../../../services/workspaces/build-workspace-context.js'

export default defineEventHandler(async (event) => {
  const { workspaceId } = getQuery(event)

  if (!workspaceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'workspaceId is required'
    })
  }

  const context = await buildWorkspaceContext({
    workspaceId
  })

  return context.artifacts
})
