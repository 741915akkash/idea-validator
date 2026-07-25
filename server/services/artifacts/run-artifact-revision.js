import { runAgent } from '../agents/run-agent.js'

export async function runArtifactRevision({ artifact }) {
  await runAgent({
    workspaceId: artifact.workspaceId,
    agent: artifact.sourceAgent,

    context: {
      revision: {
        artifactId: artifact.id
      }
    }
  })
}
