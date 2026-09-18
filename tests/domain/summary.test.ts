import { describe, it, expect } from 'vitest'
import { summarise } from '../../src/domain/summary'
import { makeEntry } from '../../src/domain/entry'

const entries = [
  makeEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' }),
  makeEntry({ date: '2025-09-02', type: 'expense', amountPence: 2000, description: 'Sheet music', category: 'equipment' }),
  makeEntry({ date: '2025-09-03', type: 'expense', amountPence: 5000, description: 'Shell', category: 'travel', claimable: false }),
  makeEntry({ date: '2025-09-04', type: 'journey', amountPence: 270, description: 'Mrs Patel', category: 'travel' }),
  makeEntry({ date: '2024-09-01', type: 'income', amountPence: 9999, description: 'last year', category: 'income' }),
]

describe('summarise', () => {
  it('totals only claimable, non-deleted entries in the tax year', () => {
    const s = summarise(entries, '2025/26', 0)
    expect(s.incomePence).toBe(3000)
    expect(s.expensesPence).toBe(2270) // 2000 + 270; fuel 5000 excluded
    expect(s.profitPence).toBe(730)
  })
  it('ignores soft-deleted entries', () => {
    const withDeleted = [...entries, makeEntry({ date: '2025-09-05', type: 'income', amountPence: 5000, description: 'x', category: 'income', deletedAt: '2025-09-06T00:00:00Z' })]
    expect(summarise(withDeleted, '2025/26', 0).incomePence).toBe(3000)
  })
  it('includes claimable home_office entries in expenses', () => {
    const withHomeOffice = [...entries, makeEntry({ date: '2025-09-05', type: 'home_office', amountPence: 1000, description: 'home office', category: 'admin', claimable: true })]
    const s = summarise(withHomeOffice, '2025/26', 0)
    expect(s.expensesPence).toBe(3270) // 2270 + 1000
  })
})
