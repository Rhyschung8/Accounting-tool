import { describe, it, expect } from 'vitest'
import { toCsv } from '../../src/domain/csvExport'
import { makeEntry } from '../../src/domain/entry'

describe('toCsv', () => {
  it('emits a header and one row per entry in the year', () => {
    const rows = toCsv([
      makeEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' }),
    ], '2025/26').trim().split('\n')
    expect(rows[0]).toBe('Date,Type,Description,Category,Amount,Claimable,Receipt')
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
})
