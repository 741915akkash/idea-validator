import { helpRegistry } from '~/help'

export function useHelpContent(key) {
  return helpRegistry[key]
}
