// tests/ui/entryList.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { EntryList } from '../../src/ui/EntryList'

async function mount() {
  const store = createStore(createMemoryStorage())
  await store.init()
  await store.addEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
  render(<StoreProvider store={store}><EntryList taxYear="2025/26" /></StoreProvider>)
  return store
}

describe('EntryList', () => {
  it('lists an entry for the year', async () => {
    await mount()
    expect(screen.getByText('Emma')).toBeInTheDocument()
    expect(screen.getByText('£30.00')).toBeInTheDocument()
  })
  it('soft-deletes with undo', async () => {
    const store = await mount()
    fireEvent.click(screen.getByText('Emma'))
    fireEvent.click(screen.getByRole('button', { name: /delete|삭제/i }))
    await waitFor(() => expect(store.getState().entries[0].deletedAt).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /undo|되돌리기/i }))
    await waitFor(() => expect(store.getState().entries[0].deletedAt).toBeNull())
  })
})
