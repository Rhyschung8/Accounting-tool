// src/domain/taxDeadlines.ts
import { currentTaxYear } from './taxYear'

export interface FilingDeadline {
  /** The tax year this deadline is for, e.g. "2025/26". */
  taxYear: string
  /** ISO date of the deadline, e.g. "2027-01-31". */
  deadlineDate: string
  /** Days remaining until the deadline (0 = today, never negative). */
  daysLeft: number
}

function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split('-').map(Number)
  const [ty, tm, td] = toIso.split('-').map(Number)
  const fromMs = Date.UTC(fy, fm - 1, fd)
  const toMs = Date.UTC(ty, tm - 1, td)
  return Math.round((toMs - fromMs) / 86_400_000)
}

/**
 * The online-filing deadline (31 January) that is currently outstanding,
 * or null if no return is currently due. A tax year's deadline is "open"
 * from the day the tax year ends (6 April) until 31 January of the year
 * after next — outside that window (the Feb–Apr gap after a deadline has
 * passed and before the next tax year ends) there's nothing due yet, so
 * this returns null rather than a deadline over a year away.
 */
export function currentFilingDeadline(today: Date = new Date()): FilingDeadline | null {
  const todayIso = today.toISOString().slice(0, 10)
  const startYear = Number(currentTaxYear(today).split('/')[0]) - 1
  const deadlineDate = `${startYear + 2}-01-31`
  const daysLeft = daysBetween(todayIso, deadlineDate)
  if (daysLeft < 0) return null
  const endShort = String((startYear + 1) % 100).padStart(2, '0')
  return { taxYear: `${startYear}/${endShort}`, deadlineDate, daysLeft }
}
