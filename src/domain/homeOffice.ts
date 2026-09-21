import type { TaxYearRates } from '../config/taxYears'
import { makeEntry, type Entry } from './entry'
import { taxYearBounds } from './taxYear'

export function monthlyBandPence(hoursPerWeek: number, rates: TaxYearRates): number {
  let pence = 0
  for (const band of [...rates.homeOfficeBands].sort((a, b) => a.minHours - b.minHours)) {
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
  const { start: taxYearStart } = taxYearBounds(taxYear)
  const entries: Entry[] = []
  for (let i = 0; i < 12; i++) {
    const monthIndex = (3 + i) % 12          // April = index 3
    const year = monthIndex >= 3 ? startYear : startYear + 1
    const mm = String(monthIndex + 1).padStart(2, '0')
    const monthKey = `${year}-${mm}`
    const date = i === 0 ? taxYearStart : `${monthKey}-01`
    entries.push(makeEntry({
      date,
      type: 'home_office',
      amountPence: bandPence,
      description: '재택근무 / Working from home',
      category: 'home_office',
      source: 'auto',
      details: { month: monthKey, hoursPerWeek, bandPence },
    }))
  }
  return entries
}
