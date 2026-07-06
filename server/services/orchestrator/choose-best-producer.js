export function chooseBestProducer(producers = []) {
  if (!producers.length) {
    return null
  }

  return producers[0]
}
