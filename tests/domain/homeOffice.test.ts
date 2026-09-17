import { describe, it, expect } from 'vitest'
import { monthlyBandPence, generateHomeOfficeMonths } from '../../src/domain/homeOffice'
import { getRates } from '../../src/config/taxYears'
import { taxYearOf } from '../../src/domain/taxYear'

const r = getRates('2025/26')

describe('monthlyBandPence', () => {
  it('is zero below the lowest band', () => { expect(monthlyBandPence(10, r)).toBe(0) })
  it('picks the 25-hour band', () => { expect(monthlyBandPence(30, r)).toBe(r.homeOfficeBands[0].monthlyPence) })
  it('picks the highest band when hours are high', () => {
    expect(monthlyBandPence(120, r)).toBe(r.homeOfficeBands[r.homeOfficeBands.length - 1].monthlyPence)
  })
})

describe('generateHomeOfficeMonths', () => {
  it('creates twelve monthly entries', () => {
    const entries = generateHomeOfficeMonths('2025/26', 30, r)
    expect(entries).toHaveLength(12)
    expect(entries.every(e => e.type === 'home_office' && e.source === 'auto')).toBe(true)
    expect(entries.every(e => e.category === 'home_office')).toBe(true)
  })
  it('creates none when hours are below the lowest band', () => {
    expect(generateHomeOfficeMonths('2025/26', 5, r)).toHaveLength(0)
  })
  it('every generated entry has a date within the requested tax year', () => {
    const taxYear = '2025/26'
    const entries = generateHomeOfficeMonths(taxYear, 30, r)
    for (const entry of entries) {
      expect(taxYearOf(entry.date)).toBe(taxYear)
    }
  })
})
