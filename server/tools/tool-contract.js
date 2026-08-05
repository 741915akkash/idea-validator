export function validateTool(tool) {
  const requiredFields = [
    'id',
    'version',

    'name',
    'description',

    'inputSchema',
    'outputSchema',

    'validateInput',
    'normalizeInput',

    'validateOutput',
    'normalizeOutput',

    'execute'
  ]

  for (const field of requiredFields) {
    if (!(field in tool)) {
      throw new Error(`Tool "${tool.id ?? 'unknown'}" is missing "${field}".`)
    }
  }

  return tool
}
