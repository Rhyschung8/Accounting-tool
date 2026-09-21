// src/domain/taxDeadlines.ts
import type { Entry } from './entry'
import { currentTaxYear, taxYearOf } from './taxYear'

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

function taxYearString(startYear: number): string {
  return `${startYear}/${String((startYear + 1) % 100).padStart(2, '0')}`
}

/**
 * Earliest tax year with any recorded activity — a proxy for when she
 * started trading, so we never show a deadline for a year before she was
 * self-employed. Tax year strings sort chronologically as plain strings
 * (same "YYYY/YY" shape throughout), same trick YearEndScreen uses.
 */
function firstTradingYear(entries: Entry[]): string | null {
  const years = entries.filter(e => !e.deletedAt).map(e => taxYearOf(e.date))
  if (years.length === 0) return null
  return years.sort()[0]
}

/**
 * The online-filing deadline (31 January) that is currently outstanding,
 * or null if no return is currently due. A tax year's deadline is "open"
 * from the day the tax year ends (6 April) until 31 January of the year
 * after next — outside that window (the Feb–Apr gap after a deadline has
 * passed and before the next tax year ends) there's nothing due yet, so
 * this returns null rather than a deadline over a year away. It also
 * returns null before her first tax year has even ended — e.g. if her
 * earliest entry is in the current tax year, there's no prior-year return
 * to chase yet.
 */
export function currentFilingDeadline(entries: Entry[], today: Date = new Date()): FilingDeadline | null {
  const firstYear = firstTradingYear(entries)
  if (firstYear === null) return null

  const todayIso = today.toISOString().slice(0, 10)
  const previousStartYear = Number(currentTaxYear(today).split('/')[0]) - 1
  const previousTaxYear = taxYearString(previousStartYear)
  if (previousTaxYear < firstYear) return null

  const deadlineDate = `${previousStartYear + 2}-01-31`
  const daysLeft = daysBetween(todayIso, deadlineDate)
  if (daysLeft < 0) return null
  return { taxYear: previousTaxYear, deadlineDate, daysLeft }
}
