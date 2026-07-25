import ToolService from '../../tools/service.js'
import { unknownTool, toolExecutionFailed } from '../../tools/tool-errors.js'

export default async function executeTool({ toolId, input, context = {} }) {
  const tool = ToolService.get(toolId)

  if (!tool) {
    return unknownTool(toolId)
  }

  const validatedInput = ToolService.validateAndNormalizeInput(toolId, input)

  if (!validatedInput.success) {
    return validatedInput
  }

  const startedAt = Date.now()

  try {
    const result = await tool.execute({
      input: validatedInput.input,
      context
    })

    if (!result?.success) {
      return result
    }

    const validatedOutput = ToolService.validateAndNormalizeOutput(toolId, result.output)

    if (!validatedOutput.success) {
      return validatedOutput
    }

    return {
      success: true,

      output: validatedOutput.output,

      metadata: {
        toolId: tool.id,
        toolVersion: tool.version,
        durationMs: Date.now() - startedAt,

        ...(result.metadata ?? {})
      }
    }
  } catch (error) {
    return toolExecutionFailed(error.message)
  }
}
