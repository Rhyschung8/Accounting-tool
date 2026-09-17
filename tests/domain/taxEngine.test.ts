import { describe, it, expect } from 'vitest'
import { estimate } from '../../src/domain/taxEngine'
import { getRates } from '../../src/config/taxYears'

const r = getRates('2025/26')

describe('estimate', () => {
  it('is zero below the allowance with no other income', () => {
    const e = estimate(1_000_000, 0, r) // £10,000 profit
    expect(e.totalPence).toBe(0)
  })
  it('taxes profit above the allowance at basic rate + class 4', () => {
    const profit = 2_000_000 // £20,000
    const taxable = profit - r.personalAllowancePence // £7,430
    const incomeTax = Math.round(taxable * r.basicRatePct / 100)
    const class4 = Math.round((profit - r.class4LowerPence) * r.class4MainPct / 100)
    const e = estimate(profit, 0, r)
    expect(e.incomeTaxPence).toBe(incomeTax)
    expect(e.class4Pence).toBe(class4)
    expect(e.totalPence).toBe(incomeTax + class4)
  })
  it('other income consumes the allowance first', () => {
    // £13,000 other income already exceeds the allowance, so all profit is taxed
    const profit = 1_000_000
    const e = estimate(profit, 1_300_000, r)
    expect(e.incomeTaxPence).toBe(Math.round(profit * r.basicRatePct / 100))
  })
  it('reports a loss without tax', () => {
    const e = estimate(-500_000, 0, r)
    expect(e.isLoss).toBe(true)
    expect(e.totalPence).toBe(0)
  })
})
