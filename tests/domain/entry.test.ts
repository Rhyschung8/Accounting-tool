import { describe, it, expect } from 'vitest'
import { makeEntry, newId } from '../../src/domain/entry'

describe('makeEntry', () => {
  it('fills defaults', () => {
    const e = makeEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
    expect(e.id).toBeTruthy()
    expect(e.createdAt).toBeTruthy()
    expect(e.claimable).toBe(true)
    expect(e.deletedAt).toBeNull()
    expect(e.source).toBe('manual')
  })
  it('respects explicit claimable false', () => {
    const e = makeEntry({ date: '2025-09-01', type: 'expense', amountPence: 5000, description: 'Shell', category: 'travel', claimable: false })
    expect(e.claimable).toBe(false)
  })
})

describe('newId', () => {
  it('is unique', () => { expect(newId()).not.toBe(newId()) })
})
