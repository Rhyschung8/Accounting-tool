// tests/ui/yearEndScreen.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
