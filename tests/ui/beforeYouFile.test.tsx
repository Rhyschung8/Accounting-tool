// tests/ui/beforeYouFile.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
