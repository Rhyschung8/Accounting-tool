import { describe, it, expect } from 'vitest'
import { shouldBackup, maybeWeeklyBackup } from '../../src/storage/backup'

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
  it('backs up at exact 7-day boundary', () => {
    expect(shouldBackup('2026-09-10T00:00:00Z', new Date('2026-09-17T00:00:00Z'))).toBe(true)
  })
})

describe('maybeWeeklyBackup — no-backup branch', () => {
  it('returns the original lastBackupIso unchanged when backup is not due', async () => {
    const now = new Date('2026-09-17T00:00:00Z')
    // 1 day ago — well within 7-day window, so shouldBackup returns false
    const recentIso = '2026-09-16T00:00:00Z'
    // dirHandle must not be called on the no-backup branch; pass a stub that throws if used
    const stubHandle = new Proxy({} as FileSystemDirectoryHandle, {
      get(_target, prop) {
        throw new Error(`dirHandle.${String(prop)} unexpectedly called on no-backup branch`)
      },
    })
    const result = await maybeWeeklyBackup(stubHandle, '{}', recentIso, now)
    expect(result).toBe(recentIso)
  })
})
