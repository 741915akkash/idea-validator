import workflowService from '../../workflows/service.js'

import agentService from '../../agents/service.js'

import { buildWorkspaceContext } from '../workspaces/build-workspace-context.js'

import { resolveWorkspaceKnowledge } from './resolve-workspace-knowledge.js'

import { runAgent } from '../agents/run-agent.js'


export async function runWorkflow({ workspaceId, workflowId }) {
  const workflow = workflowService.get(workflowId)
  console.log('RUN WORKFLOW', Date.now())

  const workspaceContext = await buildWorkspaceContext({
    workspaceId
  })

  console.log(JSON.stringify(workspaceContext, null, 2))

  const knowledge = resolveWorkspaceKnowledge({
    workspaceContext,
    requiredArtifacts: workflow.artifacts
  })

  const results = []

  for (const artifactType of workflow.artifacts) {
    const existing = knowledge.existing.find((artifact) => artifact.type === artifactType)

    if (existing) {
      results.push({
        artifact: artifactType,
        skipped: true,
        latest: existing.latest
      })

      continue
    }

    const producer = agentService.getProducer(artifactType)

    const result = await runAgent({
      workspaceId,
      workspaceContext,
      agent: producer.id
    })

    results.push({
      artifact: artifactType,
      skipped: false,
      agent: producer.id,
      result
    })

    workspaceContext.artifacts.push(...result.artifacts)
  }

  return {
    workflow: workflow.id,
    knowledge,
    results
  }
}
