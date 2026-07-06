export async function insertTasks(client, { workspaceContext, agent, tasks }) {
  if (!tasks?.length) {
    return
  }

  const workspaceId = workspaceContext.workspace.id

  for (const task of tasks) {
    await client.query(
      `
      INSERT INTO tasks (
        workspace_id,
        parent_task_id,
        title,
        description,
        status,
        priority,
        task_type,
        owner_type,
        owner_id,
        source_agent
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      `,
      [
        workspaceId,
        task.parentTaskId ?? null,
        task.title,
        task.description ?? null,
        task.status ?? 'todo',
        task.priority ?? 'medium',
        task.taskType,
        task.ownerType ?? 'agent',
        task.ownerId ?? null,
        agent.id
      ]
    )
  }
}
