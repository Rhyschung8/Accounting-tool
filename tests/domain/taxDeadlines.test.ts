import { describe, it, expect } from 'vitest'
import { currentFilingDeadline } from '../../src/domain/taxDeadlines'
import type { Entry } from '../../src/domain/entry'

function entry(date: string, overrides: Partial<Entry> = {}): Entry {
  return {
    id: date,
    date,
    type: 'income',
    amountPence: 1000,
    description: 'lesson',
    category: 'income',
    source: 'manual',
    claimable: true,
    createdAt: date,
    ...overrides,
  }
}

// A trader with a long history — the common case. First entry is years
// before any of the "today" values under test, so it never gates anything.
const longHistory: Entry[] = [entry('2022-05-01'), entry('2025-06-01')]

describe('currentFilingDeadline — continuing trader', () => {
  it('counts down to next 31 January while a return is outstanding', () => {
    const d = currentFilingDeadline(longHistory, new Date('2026-09-21'))
    expect(d).toEqual({ taxYear: '2025/26', deadlineDate: '2027-01-31', daysLeft: 132 })
  })

  it('is still open in the days just before the deadline', () => {
    const d = currentFilingDeadline(longHistory, new Date('2026-01-15'))
    expect(d).toEqual({ taxYear: '2024/25', deadlineDate: '2026-01-31', daysLeft: 16 })
  })

  it('is 0 days left on the deadline itself, not null', () => {
    const d = currentFilingDeadline(longHistory, new Date('2027-01-31'))
    expect(d).toEqual({ taxYear: '2025/26', deadlineDate: '2027-01-31', daysLeft: 0 })
  })

  it('is null in the quiet gap after a deadline passes and before the next tax year ends', () => {
    expect(currentFilingDeadline(longHistory, new Date('2026-02-15'))).toBeNull()
  })

  it('is null right up to 5 April, then open again from 6 April', () => {
    expect(currentFilingDeadline(longHistory, new Date('2026-04-05'))).toBeNull()
    const d = currentFilingDeadline(longHistory, new Date('2026-04-06'))
    expect(d?.taxYear).toBe('2025/26')
    expect(d?.daysLeft).toBe(300)
  })

  it('is null with no entries at all', () => {
    expect(currentFilingDeadline([], new Date('2026-09-21'))).toBeNull()
  })

  it('ignores deleted entries when finding the first trading year', () => {
    const entries = [entry('2020-01-01', { deletedAt: '2020-02-01' }), entry('2025-06-01')]
    const d = currentFilingDeadline(entries, new Date('2026-09-21'))
    expect(d?.taxYear).toBe('2025/26')
  })
})

describe('currentFilingDeadline — first-year trader', () => {
  it('shows nothing until her first tax year has ended — no prior-year return is due', () => {
    // Her only entry is in the current (2026/27) tax year.
    const firstYearEntries: Entry[] = [entry('2026-09-01')]
    expect(currentFilingDeadline(firstYearEntries, new Date('2026-09-21'))).toBeNull()
  })

  it('once her first tax year ends, the deadline is for that year, not the one before it', () => {
    const firstYearEntries: Entry[] = [entry('2026-09-01')]
    const d = currentFilingDeadline(firstYearEntries, new Date('2027-06-01'))
    expect(d).toEqual({ taxYear: '2026/27', deadlineDate: '2028-01-31', daysLeft: 244 })
  })
})
