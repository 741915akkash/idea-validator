export function extractJSON(content) {
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('No valid JSON object found in LLM response')
  }
  return JSON.parse(match[0])
}
