export function validateTasks(tasks = []) {
  const validTasks = []
  const warnings = []

  for (const task of tasks) {
    if (!task.title) {
      warnings.push({
        code: 'INVALID_TASK',
        message: 'Task is missing title.'
      })

      continue
    }

    if (!task.taskType) {
      warnings.push({
        code: 'INVALID_TASK',
        message: `Task "${task.title}" is missing taskType.`
      })

      continue
    }

    validTasks.push({
      title: task.title,

      description: task.description ?? '',

      priority: task.priority ?? 'medium',

      taskType: task.taskType,

      status: task.status ?? 'todo',

      ownerType: task.ownerType ?? 'agent',

      ownerId: task.ownerId ?? null,

      parentTaskId: task.parentTaskId ?? null
    })
  }

  return {
    tasks: validTasks,
    warnings
  }
}
