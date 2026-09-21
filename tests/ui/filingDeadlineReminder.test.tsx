import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilingDeadlineReminder } from '../../src/ui/FilingDeadlineReminder'

afterEach(() => {
  vi.useRealTimers()
})

describe('FilingDeadlineReminder', () => {
  it('shows a calm countdown well before the deadline', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-21'))
    render(<FilingDeadlineReminder />)
    expect(screen.getByText(/132 days until you need to file/)).toBeInTheDocument()
    expect(screen.getByText(/31 January 2027/)).toBeInTheDocument()
  })

  it('applies urgent styling within 30 days of the deadline', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-01-10'))
    const { container } = render(<FilingDeadlineReminder />)
    expect(container.querySelector('.deadline-reminder--urgent')).toBeInTheDocument()
  })

  it('renders nothing in the quiet gap after a deadline has passed', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15'))
    const { container } = render(<FilingDeadlineReminder />)
    expect(container.firstChild).toBeNull()
  })
})
