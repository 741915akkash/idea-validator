import { runWorkflow } from '../../services/workflows/index.js'

export default defineEventHandler(async (event) => {
  console.log('==============================')
  console.log('NEW HTTP REQUEST', new Date().toISOString())
  console.log({
    time: new Date().toISOString(),
    requestId: Math.random().toString(36).slice(2)
  })

  const body = await readBody(event)

  return await runWorkflow({
    workspaceId: body.workspaceId,
    workflowId: body.workflowId
  })
})
