import type { TaxYearRates } from '../config/taxYears'
import { makeEntry, type Entry } from './entry'

export function monthlyBandPence(hoursPerWeek: number, rates: TaxYearRates): number {
  let pence = 0
  for (const band of rates.homeOfficeBands) {
    if (hoursPerWeek >= band.minHours) pence = band.monthlyPence
  }
  return pence
}

export function generateHomeOfficeMonths(
  taxYear: string,
  hoursPerWeek: number,
  rates: TaxYearRates,
): Entry[] {
  const bandPence = monthlyBandPence(hoursPerWeek, rates)
  if (bandPence === 0) return []
  const startYear = Number(taxYear.split('/')[0])
  const entries: Entry[] = []
  for (let i = 0; i < 12; i++) {
    const monthIndex = (3 + i) % 12          // April = index 3
    const year = monthIndex >= 3 ? startYear : startYear + 1
    const mm = String(monthIndex + 1).padStart(2, '0')
    const monthKey = `${year}-${mm}`
    entries.push(makeEntry({
      date: `${monthKey}-01`,
      type: 'home_office',
      amountPence: bandPence,
      description: 'Working from home / 재택근무',
      category: 'home_office',
      source: 'auto',
      details: { month: monthKey, hoursPerWeek, bandPence },
    }))
  }
  return entries
}
