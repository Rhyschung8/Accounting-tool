import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { FilingDeadlineReminder } from '../../src/ui/FilingDeadlineReminder'

afterEach(() => {
  vi.useRealTimers()
})

async function mountWith(entryDates: string[]) {
  const store = createStore(createMemoryStorage())
  await store.init()
  for (const date of entryDates) {
    await store.addEntry({ date, type: 'income', amountPence: 100000, description: 'lessons', category: 'income' })
  }
  return render(<StoreProvider store={store}><FilingDeadlineReminder /></StoreProvider>)
}

describe('FilingDeadlineReminder', () => {
  it('shows a calm countdown and the tax year it belongs to, well before the deadline', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-21'))
    await mountWith(['2022-05-01'])
    expect(screen.getByText(/132 days until you need to file/)).toBeInTheDocument()
    expect(screen.getByText(/31 January 2027/)).toBeInTheDocument()
    expect(screen.getByText('Tax year 2025/26')).toBeInTheDocument()
  })

  it('applies urgent styling within 30 days of the deadline', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-01-10'))
    const { container } = await mountWith(['2022-05-01'])
    expect(container.querySelector('.deadline-reminder--urgent')).toBeInTheDocument()
  })

  it('renders nothing in the quiet gap after a deadline has passed', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15'))
    const { container } = await mountWith(['2022-05-01'])
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing with no entries', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-21'))
    const { container } = await mountWith([])
    expect(container.firstChild).toBeNull()
  })

  it('for a first-year trader, shows the year she started in, not the year before', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-06-01'))
    await mountWith(['2026-09-01'])
    expect(screen.getByText('Tax year 2026/27')).toBeInTheDocument()
    expect(screen.getByText(/31 January 2028/)).toBeInTheDocument()
  })
})
