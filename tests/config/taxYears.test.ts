// tests/config/taxYears.test.ts
import { describe, it, expect } from 'vitest'
import { getRates, TAX_YEARS } from '../../src/config/taxYears'

describe('tax year config', () => {
  it('has both required years', () => {
    expect(Object.keys(TAX_YEARS)).toEqual(expect.arrayContaining(['2025/26', '2026/27']))
  })
  it('throws clearly for a missing year', () => {
    expect(() => getRates('2099/00')).toThrow(/no tax rates/i)
  })
  it('home-office bands are ascending by hours', () => {
    for (const y of Object.values(TAX_YEARS)) {
      const hours = y.homeOfficeBands.map(b => b.minHours)
      expect([...hours].sort((a, b) => a - b)).toEqual(hours)
    }
  })
  it('class 4 lower threshold is below upper', () => {
    for (const y of Object.values(TAX_YEARS)) {
      expect(y.class4LowerPence).toBeLessThan(y.class4UpperPence)
    }
  })
})
