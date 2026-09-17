// tests/ui/summaryPanel.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryPanel } from '../../src/ui/SummaryPanel'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { StoreProvider } from '../../src/state/useStore'

async function renderWithData() {
  const store = createStore(createMemoryStorage())
  await store.init()
  await store.addEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
  render(<StoreProvider store={store}><SummaryPanel taxYear="2025/26" /></StoreProvider>)
}

describe('SummaryPanel', () => {
  it('shows income and the estimate caveat', async () => {
    await renderWithData()
    expect(screen.getAllByText('£30.00').length).toBeGreaterThan(0)
    expect(screen.getByText(/estimate to help you plan/i)).toBeInTheDocument()
  })
})
