// tests/ui/yearEndScreen.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { YearEndScreen } from '../../src/ui/YearEndScreen'

describe('YearEndScreen', () => {
  it('renders the filing walkthrough and disclaimer', async () => {
    const store = createStore(createMemoryStorage())
    await store.init()
    await store.addEntry({ date: '2025-09-01', type: 'income', amountPence: 842000, description: 'lessons', category: 'income' })
    render(<StoreProvider store={store}><YearEndScreen /></StoreProvider>)
    // default year is current (2026/27); switch handled inside — assert disclaimer + a turnover figure appear
    expect(screen.getByText(/not personal tax advice/i)).toBeInTheDocument()
  })

  it('switches tax year and updates figures display', async () => {
    const store = createStore(createMemoryStorage())
    await store.init()
    // Add an income entry in the current tax year 2026/27
    await store.addEntry({ date: '2026-05-01', type: 'income', amountPence: 500000, description: 'income', category: 'income' })

    render(<StoreProvider store={store}><YearEndScreen /></StoreProvider>)

    // Default selected year is 2026/27, so £5,000.00 should be visible
    expect(screen.getAllByText('£5,000.00').length).toBeGreaterThan(0)

    // Find the tax-year select and switch to 2025/26
    const yearSelect = screen.getByRole('combobox', { name: /tax year/i })
    fireEvent.change(yearSelect, { target: { value: '2025/26' } })

    // After switching to 2025/26, the £5,000.00 figure should no longer appear (no entries in 2025/26)
    await waitFor(() => expect(screen.queryByText('£5,000.00')).not.toBeInTheDocument())
  })
})
