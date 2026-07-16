export default async function execute({ input, runtime }) {
  const expression = input.expression

  // Temporary implementation.
  // We'll replace this with a proper parser later.
  const result = Function(`"use strict"; return (${expression})`)()

  return {
    success: true,

    output: {
      result
    }
  }
}
