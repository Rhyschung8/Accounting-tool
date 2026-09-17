import { describe, it, expect } from 'vitest'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { DEFAULT_SETTINGS } from '../../src/storage/storage'

describe('memory storage', () => {
  it('round-trips app data', async () => {
    const s = createMemoryStorage()
    const data = await s.load()
    expect(data.entries).toEqual([])
    expect(data.settings).toEqual(DEFAULT_SETTINGS)
    data.settings.hoursPerWeekAtHome = 30
    await s.save(data)
    expect((await s.load()).settings.hoursPerWeekAtHome).toBe(30)
  })
})
