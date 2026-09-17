// tests/ui/settings.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { Settings } from '../../src/ui/Settings'

async function mount() {
  const store = createStore(createMemoryStorage())
  await store.init()
  render(<StoreProvider store={store}><Settings /></StoreProvider>)
  return store
}

describe('Settings', () => {
  it('updates home hours and regenerates home-office entries', async () => {
    const store = await mount()
    fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: /save hours|시간 저장/i }))
    await waitFor(() => expect(store.getState().settings.hoursPerWeekAtHome).toBe(30))
    await waitFor(() => expect(store.getState().entries.filter(e => e.type === 'home_office')).toHaveLength(12))
  })

  it('ignores invalid hours (empty or NaN) and preserves existing settings', async () => {
    const store = await mount()
    // First, save valid hours
    fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: /save hours|시간 저장/i }))
    await waitFor(() => expect(store.getState().settings.hoursPerWeekAtHome).toBe(30))
    await waitFor(() => expect(store.getState().entries.filter(e => e.type === 'home_office')).toHaveLength(12))

    // Now clear the field and try to save empty value
    fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /save hours|시간 저장/i }))

    // Assert that the invalid save was ignored: hours should still be 30 and entries should still be 12
    await waitFor(() => expect(store.getState().settings.hoursPerWeekAtHome).toBe(30))
    expect(store.getState().entries.filter(e => e.type === 'home_office')).toHaveLength(12)
  })
})
