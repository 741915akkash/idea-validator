import GoalService from '../../goals/service.js'

import { buildWorkspaceContext } from '../workspaces/build-workspace-context.js'

import { buildExecutionPlan } from './build-execution-plan.js'

import { runAgent } from '../agents/run-agent.js'

export async function orchestrateGoal({ workspaceId, goal }) {
  const goalDefinition = GoalService.get(goal)

  if (!goalDefinition) {
    throw new Error(`Unknown goal "${goal}".`)
  }

  const workspaceContext = await buildWorkspaceContext({
    workspaceId
  })

  const executionPlan = buildExecutionPlan({
    workspaceContext,
    requiredArtifacts: goalDefinition.requiredArtifacts
  })

  const results = []

  for (const agent of executionPlan.agents) {
    const result = await runAgent({
      workspaceContext,
      agent: agent.id
    })

    results.push({
      agent: agent.id,
      result
    })
  }

  return {
    goal: goalDefinition.id,

    plan: executionPlan.plan,

    knowledge: executionPlan.knowledge,

    results
  }
}
