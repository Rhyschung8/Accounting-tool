// tests/config/sa103sBoxes.test.ts
import { describe, it, expect } from 'vitest'
import { getBox, TURNOVER_BOX, EXPENSES_BOX, NET_PROFIT_BOX } from '../../src/config/sa103sBoxes'

describe('sa103sBoxes', () => {
  it('exposes turnover/expenses/netProfit boxes with bilingual labels', () => {
    for (const box of [TURNOVER_BOX, EXPENSES_BOX, NET_PROFIT_BOX]) {
      expect(box.number).toMatch(/\d/)
      expect(box.labelKo.length).toBeGreaterThan(0)
      expect(box.labelEn.length).toBeGreaterThan(0)
    }
  })
  it('getBox looks up by role', () => {
    expect(getBox('turnover')).toBe(TURNOVER_BOX)
    expect(getBox('expenses')).toBe(EXPENSES_BOX)
  })
})
