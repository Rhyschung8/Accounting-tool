import { describe, it, expect } from 'vitest'
import { taxYearOf, taxYearBounds, currentTaxYear, formatTaxYear } from '../../src/domain/taxYear'

describe('taxYearOf', () => {
  it('5 April is the end of the prior year', () => { expect(taxYearOf('2026-04-05')).toBe('2025/26') })
  it('6 April starts a new year', () => { expect(taxYearOf('2026-04-06')).toBe('2026/27') })
  it('mid-year', () => { expect(taxYearOf('2025-09-17')).toBe('2025/26') })
  it('1 January belongs to the year that started the prior April', () => { expect(taxYearOf('2026-01-10')).toBe('2025/26') })
})

describe('taxYearBounds', () => {
  it('gives inclusive April bounds', () => {
    expect(taxYearBounds('2025/26')).toEqual({ start: '2025-04-06', end: '2026-04-05' })
  })
})

describe('currentTaxYear', () => {
  it('uses supplied date', () => { expect(currentTaxYear(new Date('2026-09-17'))).toBe('2026/27') })
})

describe('formatTaxYear', () => {
  it('formats readable bounds', () => { expect(formatTaxYear('2025/26')).toBe('6 Apr 2025 – 5 Apr 2026') })
})
