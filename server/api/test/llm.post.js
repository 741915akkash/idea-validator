import { generate } from "../../services/llm/generate"

export default defineEventHandler(async () => {
  return await generate({
    system: `
You are a helpful assistant.

Do not think aloud.

Do not include reasoning.

Return only the final answer.

Return ONLY JSON.
`,

    user: `
Return exactly this:

{
  "hello": "world"
}
`
  })
})
