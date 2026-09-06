export function isBusinessDay(date) {
  const day = date.getUTCDay()
  return day !== 0 && day !== 6
}

export function addBusinessDays(date, days) {
  const result = new Date(date)
  let remaining = Number(days) || 0

  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1)

    if (isBusinessDay(result)) {
      remaining--
    }
  }

  return result
}
