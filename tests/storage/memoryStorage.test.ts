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

  it('saves and reads receipt urls', async () => {
    const s = createMemoryStorage()
    const file = new File(['x'], 'r.jpg')
    const filename = await s.saveReceipt(file)
    expect(filename).toBeTruthy()
    expect(filename.length).toBeGreaterThan(0)
    const url = await s.readReceiptUrl(filename)
    expect(url).not.toBeNull()
    expect(typeof url).toBe('string')
  })

  it('returns null for nonexistent receipt', async () => {
    const s = createMemoryStorage()
    const url = await s.readReceiptUrl('does-not-exist.jpg')
    expect(url).toBeNull()
  })
})
