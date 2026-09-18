// tests/ui/settings.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { Settings } from '../../src/ui/Settings'
import { taxYearOf } from '../../src/domain/taxYear'

async function mount() {
  const store = createStore(createMemoryStorage())
  await store.init()
  render(<StoreProvider store={store}><Settings /></StoreProvider>)
  return store
}

describe('Settings', () => {
  it('updates home hours and regenerates home-office entries for ALL tax years (I2)', async () => {
    const store = await mount()
    fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: /save hours|시간 저장/i }))
    await waitFor(() => expect(store.getState().settings.hoursPerWeekAtHome).toBe(30))
    // Two configured tax years × 12 months = 24 auto home-office entries.
    await waitFor(() => expect(store.getState().entries.filter(e => e.type === 'home_office')).toHaveLength(24))
    const autos = store.getState().entries.filter(e => e.type === 'home_office')
    expect(autos.filter(e => taxYearOf(e.date) === '2025/26')).toHaveLength(12)
    expect(autos.filter(e => taxYearOf(e.date) === '2026/27')).toHaveLength(12)
  })

  it('toggling the spouse checkbox updates spouseIsBasicRateTaxpayer to true', async () => {
    const store = await mount()
    const checkbox = screen.getByLabelText(/basic-rate/i)
    expect(store.getState().settings.spouseIsBasicRateTaxpayer).toBe(false)
    fireEvent.click(checkbox)
    await waitFor(() => expect(store.getState().settings.spouseIsBasicRateTaxpayer).toBe(true))
  })

  it('ignores invalid hours (empty or NaN) and preserves existing settings', async () => {
    const store = await mount()
    // First, save valid hours
    fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: /save hours|시간 저장/i }))
    await waitFor(() => expect(store.getState().settings.hoursPerWeekAtHome).toBe(30))
    await waitFor(() => expect(store.getState().entries.filter(e => e.type === 'home_office')).toHaveLength(24))

    // Now clear the field and try to save empty value
    fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /save hours|시간 저장/i }))

    // Assert that the invalid save was ignored: hours should still be 30 and entries should still be 24
    await waitFor(() => expect(store.getState().settings.hoursPerWeekAtHome).toBe(30))
    expect(store.getState().entries.filter(e => e.type === 'home_office')).toHaveLength(24)
  })
})
