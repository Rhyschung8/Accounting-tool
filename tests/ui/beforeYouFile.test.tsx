// tests/ui/beforeYouFile.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { BeforeYouFile } from '../../src/ui/BeforeYouFile'

async function mount() {
  const store = createStore(createMemoryStorage())
  await store.init()
  await store.addEntry({ date: '2025-09-02', type: 'expense', amountPence: 2000, description: 'mystery', category: 'uncategorised' })
  render(<StoreProvider store={store}><BeforeYouFile taxYear="2025/26" /></StoreProvider>)
}

describe('BeforeYouFile', () => {
  it('flags uncategorised entries', async () => {
    await mount()
    expect(screen.getByText(/needs checking|확인 필요/i)).toBeInTheDocument()
  })

  it('flags a large expense (>= threshold) with no receipt', async () => {
    const store = createStore(createMemoryStorage())
    await store.init()
    // largePurchaseThresholdPence default is 50_000 (£500)
    await store.addEntry({
      date: '2025-09-02',
      type: 'expense',
      amountPence: 50_000,
      description: 'Keyboard',
      category: 'equipment',
    })
    render(<StoreProvider store={store}><BeforeYouFile taxYear="2025/26" /></StoreProvider>)
    await waitFor(() =>
      expect(screen.getByText(/large purchase without receipt|영수증 없는 큰 지출/i)).toBeInTheDocument()
    )
  })

  it('warns when there are no home_office entries for the year', async () => {
    const store = createStore(createMemoryStorage())
    await store.init()
    // No home_office entry added — the warning should show
    render(<StoreProvider store={store}><BeforeYouFile taxYear="2025/26" /></StoreProvider>)
    await waitFor(() =>
      expect(screen.getByText(/no home office entry found|재택근무 항목이 없어요/i)).toBeInTheDocument()
    )
  })
})
