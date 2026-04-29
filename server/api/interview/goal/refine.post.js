import { pool } from '../../../db'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { raw_goal } = body

  if (!raw_goal) {
    throw createError({ statusCode: 400, statusMessage: 'raw_goal required' })
  }

  const prompt = `
Rewrite the following vague goal into TWO clearer, objective,
concrete goals that:
- Focus on past behavior
- Are observable from conversation
- Are specific and bounded
- Avoid "why", "feel", "think", "would"

Return JSON:
{
  "option1": "...",
  "option2": "..."
}

Goal:
"${raw_goal}"
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  return JSON.parse(response.choices[0].message.content)
})
