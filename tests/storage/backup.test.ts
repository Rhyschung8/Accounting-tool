import { describe, it, expect } from 'vitest'
import { shouldBackup } from '../../src/storage/backup'

describe('shouldBackup', () => {
  it('backs up when there is no prior backup', () => {
    expect(shouldBackup(null, new Date('2026-09-17'))).toBe(true)
  })
  it('backs up after 7 days', () => {
    expect(shouldBackup('2026-09-09T00:00:00Z', new Date('2026-09-17T00:00:00Z'))).toBe(true)
  })
  it('does not back up within 7 days', () => {
    expect(shouldBackup('2026-09-15T00:00:00Z', new Date('2026-09-17T00:00:00Z'))).toBe(false)
  })
})
