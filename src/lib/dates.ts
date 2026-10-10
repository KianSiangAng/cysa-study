/** Local-time day helpers. Using Date setters keeps DST transitions correct. */
export function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function addDays(ms: number, days: number): number {
  const d = new Date(ms)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

/** Monday of the week containing `ms`, as a local YYYY-MM-DD key. */
export function weekKey(ms: number): string {
  const d = new Date(startOfDay(ms))
  const sinceMonday = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - sinceMonday)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}
