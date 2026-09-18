import { describe, it, expect } from 'vitest'
import { toCsv } from '../../src/domain/csvExport'
import { makeEntry } from '../../src/domain/entry'

describe('toCsv', () => {
  it('emits a header and one row per entry in the year', () => {
    const rows = toCsv([
      makeEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' }),
    ], '2025/26').trim().split('\n')
    expect(rows[0]).toBe('Date,Type,Description,Category,Amount,Claimable,Receipt,HMRC box')
    expect(rows[1]).toContain('2025-09-01,income,Emma,income,30.00,yes,')
  })
  it('quotes fields containing commas', () => {
    const csv = toCsv([
      makeEntry({ date: '2025-09-01', type: 'expense', amountPence: 1000, description: 'Books, music', category: 'equipment' }),
    ], '2025/26')
    expect(csv).toContain('"Books, music"')
  })
  it('excludes other tax years and deleted rows', () => {
    const csv = toCsv([
      makeEntry({ date: '2024-01-01', type: 'income', amountPence: 100, description: 'old', category: 'income' }),
    ], '2025/26')
    expect(csv.trim().split('\n')).toHaveLength(1) // header only
  })
  it('quotes receiptFile containing commas', () => {
    const csv = toCsv([
      makeEntry({ date: '2025-09-01', type: 'expense', amountPence: 1000, description: 'office', category: 'equipment', receiptFile: 'receipt,2025.jpg' }),
    ], '2025/26')
    expect(csv).toContain('"receipt,2025.jpg"')
  })
  it('puts the turnover box number (9) in the HMRC box column for income rows', () => {
    const rows = toCsv([
      makeEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' }),
    ], '2025/26').trim().split('\n')
    expect(rows[1]).toMatch(/,9$/)
  })
  it('puts the expenses box number (20) in the HMRC box column for claimable non-income rows', () => {
    const rows = toCsv([
      makeEntry({ date: '2025-09-01', type: 'expense', amountPence: 1000, description: 'Sheet music', category: 'equipment', claimable: true }),
    ], '2025/26').trim().split('\n')
    expect(rows[1]).toMatch(/,20$/)
  })
  it('leaves the HMRC box column empty for non-claimable rows (e.g. fuel)', () => {
    const rows = toCsv([
      makeEntry({ date: '2025-09-01', type: 'expense', amountPence: 5000, description: 'Fuel', category: 'travel', claimable: false }),
    ], '2025/26').trim().split('\n')
    expect(rows[1]).toMatch(/,$/)
  })
})
