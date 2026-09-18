import { describe, it, expect } from 'vitest'
import { figuresFor } from '../../src/domain/filingFigures'
import { makeEntry } from '../../src/domain/entry'

const entries = [
  makeEntry({ date: '2025-09-01', type: 'income', amountPence: 300000, description: 'lessons', category: 'income' }),
  makeEntry({ date: '2025-09-02', type: 'expense', amountPence: 20000, description: 'sheet music', category: 'equipment' }),
  makeEntry({ date: '2025-09-03', type: 'journey', amountPence: 5000, description: 'Mrs Patel', category: 'travel' }),
  makeEntry({ date: '2025-09-04', type: 'expense', amountPence: 9000, description: 'Shell', category: 'travel', claimable: false }),
  makeEntry({ date: '2024-09-01', type: 'income', amountPence: 99999, description: 'last year', category: 'income' }),
]

describe('figuresFor', () => {
  it('computes turnover, expenses and net for the year', () => {
    const f = figuresFor(entries, '2025/26')
    expect(f.turnoverPence).toBe(300000)
    expect(f.expensesPence).toBe(25000) // 20000 + 5000; fuel excluded
    expect(f.netPence).toBe(275000)
    expect(f.isLoss).toBe(false)
  })
  it('groups claimable expenses by category', () => {
    const f = figuresFor(entries, '2025/26')
    const eq = f.byCategory.find(c => c.key === 'equipment')
    const tr = f.byCategory.find(c => c.key === 'travel')
    expect(eq?.amountPence).toBe(20000)
    expect(tr?.amountPence).toBe(5000)
  })
  it('reports a loss when expenses exceed turnover', () => {
    const loss = [
      makeEntry({ date: '2025-05-01', type: 'income', amountPence: 10000, description: 'x', category: 'income' }),
      makeEntry({ date: '2025-05-02', type: 'expense', amountPence: 600000, description: 'piano', category: 'equipment' }),
    ]
    const f = figuresFor(loss, '2025/26')
    expect(f.isLoss).toBe(true)
    expect(f.netPence).toBe(-590000)
  })
})
