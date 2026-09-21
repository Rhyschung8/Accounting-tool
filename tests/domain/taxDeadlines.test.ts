import { describe, it, expect } from 'vitest'
import { currentFilingDeadline } from '../../src/domain/taxDeadlines'

describe('currentFilingDeadline', () => {
  it('counts down to next 31 January while a return is outstanding', () => {
    const d = currentFilingDeadline(new Date('2026-09-21'))
    expect(d).toEqual({ taxYear: '2025/26', deadlineDate: '2027-01-31', daysLeft: 132 })
  })

  it('is still open in the days just before the deadline', () => {
    const d = currentFilingDeadline(new Date('2026-01-15'))
    expect(d).toEqual({ taxYear: '2024/25', deadlineDate: '2026-01-31', daysLeft: 16 })
  })

  it('is 0 days left on the deadline itself, not null', () => {
    const d = currentFilingDeadline(new Date('2027-01-31'))
    expect(d).toEqual({ taxYear: '2025/26', deadlineDate: '2027-01-31', daysLeft: 0 })
  })

  it('is null in the quiet gap after a deadline passes and before the next tax year ends', () => {
    const d = currentFilingDeadline(new Date('2026-02-15'))
    expect(d).toBeNull()
  })

  it('is null right up to 5 April, then open again from 6 April', () => {
    expect(currentFilingDeadline(new Date('2026-04-05'))).toBeNull()
    const d = currentFilingDeadline(new Date('2026-04-06'))
    expect(d?.taxYear).toBe('2025/26')
    expect(d?.daysLeft).toBe(300)
  })
})
