import { resolveWorkspaceKnowledge } from './resolve-workspace-knowledge.js'
import { resolveAgentPlan } from './resolve-agent-plan.js'

export function buildExecutionPlan({ workspaceContext, requiredArtifacts }) {
  const knowledge = resolveWorkspaceKnowledge({
    workspaceContext,
    requiredArtifacts
  })

  const agents = resolveAgentPlan({
    requiredArtifacts: knowledge.missing
  })

  return {
    requiredArtifacts,

    knowledge,

    agents,

    plan: agents.map((agent) => agent.id)
  }
}
