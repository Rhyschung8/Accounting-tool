// tests/domain/nudges.test.ts
import { describe, it, expect } from 'vitest'
import { computeNudges } from '../../src/domain/nudges'
import { getRates } from '../../src/config/taxYears'
import { DEFAULT_SETTINGS } from '../../src/storage/storage'
import type { FilingFigures } from '../../src/domain/filingFigures'

const r = getRates('2025/26')
const fig = (turnover: number, expenses: number): FilingFigures => ({
  taxYear: '2025/26', turnoverPence: turnover, expensesPence: expenses,
  netPence: turnover - expenses, isLoss: turnover - expenses < 0, byCategory: [],
})

describe('computeNudges', () => {
  it('shows must_file once turnover exceeds the trading allowance', () => {
    const ids = computeNudges(fig(500000, 100000), DEFAULT_SETTINGS, r).map(n => n.id)
    expect(ids).toContain('must_file')
  })
  it('shows state_pension when profit is positive but below the small profits threshold', () => {
    const nudges = computeNudges(fig(600000, 100000), DEFAULT_SETTINGS, r) // profit 500000 < SPT
    expect(nudges.map(n => n.id)).toContain('state_pension')
    const nudge = nudges.find(n => n.id === 'state_pension')!
    // class2WeeklyPence for 2025/26 is 350 → £3.50
    expect(nudge.bodyEn).toContain('£3.50')
    expect(nudge.bodyKo).toContain('£3.50')
  })
  it('shows trading_allowance when expenses are under £1,000', () => {
    const ids = computeNudges(fig(500000, 50000), DEFAULT_SETTINGS, r).map(n => n.id)
    expect(ids).toContain('trading_allowance')
  })
  it('shows marriage_allowance only when income is under the allowance AND spouse is basic-rate', () => {
    const low = fig(800000, 100000) // net 700000 < personal allowance
    expect(computeNudges(low, DEFAULT_SETTINGS, r).map(n => n.id)).not.toContain('marriage_allowance')
    const withSpouse = { ...DEFAULT_SETTINGS, spouseIsBasicRateTaxpayer: true }
    expect(computeNudges(low, withSpouse, r).map(n => n.id)).toContain('marriage_allowance')
  })
  it('does not show payments_on_account when tax + Class 4 NI stays under £1,000', () => {
    // profit £16,000 → taxable £3,430 → tax+NI 26% = £891.80, under £1,000
    const ids = computeNudges(fig(1_600_000, 0), DEFAULT_SETTINGS, r).map(n => n.id)
    expect(ids).not.toContain('payments_on_account')
  })
  it('shows payments_on_account once tax + Class 4 NI exceeds £1,000', () => {
    // profit £17,000 → taxable £4,430 → tax+NI 26% = £1,151.80, over £1,000
    const ids = computeNudges(fig(1_700_000, 0), DEFAULT_SETTINGS, r).map(n => n.id)
    expect(ids).toContain('payments_on_account')
  })
  it('does not show payments_on_account on a loss', () => {
    const ids = computeNudges(fig(100000, 500000), DEFAULT_SETTINGS, r).map(n => n.id)
    expect(ids).not.toContain('payments_on_account')
  })
})
