/** Renders an expense amount as ledger-style signed cents, e.g. `42.5` -> `-42.10`. */
export function formatAmount(amount: number): string {
  return `-${amount.toFixed(2)}`
}

/** Renders an ISO `YYYY-MM-DD` date as the ledger tape's `MM.DD` form. */
export function formatDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  return `${month}.${day}`
}

/** True when `isoDate` falls within the given `YYYY-MM` month key. */
export function isInMonth(isoDate: string, monthKey: string): boolean {
  return isoDate.startsWith(monthKey)
}

/** Formats a `Date` as its `YYYY-MM` month key, in local time. */
export function currentMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
