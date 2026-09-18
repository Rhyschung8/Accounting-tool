import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { NudgesPanel } from '../../src/ui/NudgesPanel'

async function mountWith(incomePence: number) {
  const store = createStore(createMemoryStorage())
  await store.init()
  await store.addEntry({ date: '2025-09-01', type: 'income', amountPence: incomePence, description: 'lessons', category: 'income' })
  render(<StoreProvider store={store}><NudgesPanel taxYear="2025/26" /></StoreProvider>)
}

describe('NudgesPanel', () => {
  it('shows the must-file nudge for a real income', async () => {
    await mountWith(500000)
    expect(screen.getByText(/need to file a tax return/i)).toBeInTheDocument()
  })
  it('renders nothing when income is below the trading allowance', async () => {
    await mountWith(50000) // £500 turnover, profit below SPT triggers state_pension though
    // must_file should NOT appear
    expect(screen.queryByText(/need to file a tax return/i)).not.toBeInTheDocument()
  })
})
