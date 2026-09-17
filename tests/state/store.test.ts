// tests/state/store.test.ts
import { describe, it, expect } from 'vitest'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'

async function freshStore() {
  const store = createStore(createMemoryStorage())
  await store.init()
  return store
}

describe('store', () => {
  it('adds an income entry', async () => {
    const s = await freshStore()
    await s.addEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
    expect(s.getState().entries).toHaveLength(1)
  })
  it('auto-categorises an expense with no category', async () => {
    const s = await freshStore()
    await s.addEntry({ date: '2025-09-02', type: 'expense', amountPence: 2000, description: 'Sheet music' })
    expect(s.getState().entries[0].category).toBe('equipment')
  })
  it('marks detected fuel not claimable', async () => {
    const s = await freshStore()
    await s.addEntry({ date: '2025-09-02', type: 'expense', amountPence: 5000, description: 'Shell garage' })
    expect(s.getState().entries[0].claimable).toBe(false)
  })
  it('forces fuel not claimable even when a category is supplied (C1)', async () => {
    const s = await freshStore()
    await s.addEntry({ type: 'expense', category: 'travel', description: 'Shell petrol', amountPence: 4000, date: '2025-09-02' })
    expect(s.getState().entries[0].claimable).toBe(false)
  })
  it('soft-deletes and restores', async () => {
    const s = await freshStore()
    await s.addEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
    const id = s.getState().entries[0].id
    await s.softDelete(id)
    expect(s.getState().entries[0].deletedAt).toBeTruthy()
    await s.restore(id)
    expect(s.getState().entries[0].deletedAt).toBeNull()
  })
  it('learns a merchant and applies it next time', async () => {
    const s = await freshStore()
    await s.learnMerchant('Hobgoblin Music', 'equipment')
    await s.addEntry({ date: '2025-09-03', type: 'expense', amountPence: 1500, description: 'HOBGOBLIN MUSIC LONDON' })
    expect(s.getState().entries[0].category).toBe('equipment')
  })
  it('regenerates home-office months from settings', async () => {
    const s = await freshStore()
    await s.setSettings({ hoursPerWeekAtHome: 30 })
    await s.regenerateHomeOffice('2025/26')
    const autos = s.getState().entries.filter(e => e.type === 'home_office')
    expect(autos).toHaveLength(12)
  })
  it('regenerateHomeOffice is idempotent (R3 regression)', async () => {
    const s = await freshStore()
    await s.setSettings({ hoursPerWeekAtHome: 30 })
    await s.regenerateHomeOffice('2025/26')
    await s.regenerateHomeOffice('2025/26')
    const autos = s.getState().entries.filter(e => e.type === 'home_office')
    expect(autos).toHaveLength(12)
  })
  it('getState is defined before init() resolves', () => {
    const store = createStore(createMemoryStorage())
    const state = store.getState()
    expect(state).toBeDefined()
    expect(state.entries).toEqual([])
  })
  it('persists entries via adapter across store instances', async () => {
    const adapter = createMemoryStorage()
    const store1 = createStore(adapter)
    await store1.init()
    await store1.addEntry({ date: '2025-09-01', type: 'income', amountPence: 5000, description: 'Test income', category: 'income' })

    const store2 = createStore(adapter)
    await store2.init()
    expect(store2.getState().entries).toHaveLength(1)
    expect(store2.getState().entries[0].description).toBe('Test income')
  })
})
