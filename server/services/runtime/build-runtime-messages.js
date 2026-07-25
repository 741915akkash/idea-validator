// server/services/runtime/build-runtime-messages.js

export function buildRuntimeMessages({ system, user }) {
  return [
    {
      role: 'system',
      content: system
    },
    {
      role: 'user',
      content: user
    }
  ]
}
