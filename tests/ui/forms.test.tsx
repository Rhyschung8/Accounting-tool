// tests/ui/forms.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { GotPaidForm } from '../../src/ui/forms/GotPaidForm'
import { BoughtSomethingForm } from '../../src/ui/forms/BoughtSomethingForm'
import { DroveToLessonForm } from '../../src/ui/forms/DroveToLessonForm'
import { WorkedFromHomeForm } from '../../src/ui/forms/WorkedFromHomeForm'
import { mileagePence } from '../../src/domain/mileage'
import { getRates } from '../../src/config/taxYears'
import { currentTaxYear } from '../../src/domain/taxYear'
import { formatPounds } from '../../src/domain/money'
import React from 'react'

async function mount(node: (store: ReturnType<typeof createStore>) => React.ReactElement) {
  const store = createStore(createMemoryStorage())
  await store.init()
  render(<StoreProvider store={store}>{node(store)}</StoreProvider>)
  return store
}

describe('GotPaidForm', () => {
  it('adds a new payment', async () => {
    const store = await mount(() => <GotPaidForm onDone={() => {}} />)
    fireEvent.click(screen.getByText(/someone new/i))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Emma' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(store.getState().entries.filter(e => e.type === 'income')).toHaveLength(1))
  })

  it('shows repeat-payer buttons from prior income entries', async () => {
    const storage = createMemoryStorage()
    const store = createStore(storage)
    await store.init()
    await store.addEntry({
      date: '2026-09-01',
      type: 'income',
      amountPence: 3000,
      description: 'Alice',
      category: 'income',
    })
    render(<StoreProvider store={store}><GotPaidForm onDone={() => {}} /></StoreProvider>)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('repeat-payer tap adds entry and calls onDone', async () => {
    const storage = createMemoryStorage()
    const store = createStore(storage)
    await store.init()
    await store.addEntry({
      date: '2026-09-01',
      type: 'income',
      amountPence: 4500,
      description: 'Bob',
      category: 'income',
    })
    let done = false
    render(
      <StoreProvider store={store}>
        <GotPaidForm onDone={() => { done = true }} />
      </StoreProvider>,
    )
    const initialCount = store.getState().entries.filter(e => e.type === 'income').length
    fireEvent.click(screen.getByText(/Bob/))
    await waitFor(() => expect(store.getState().entries.filter(e => e.type === 'income')).toHaveLength(initialCount + 1))
    expect(done).toBe(true)
  })
})

describe('BoughtSomethingForm', () => {
  it('suggests a category from the description', async () => {
    await mount(() => <BoughtSomethingForm onDone={() => {}} />)
    fireEvent.change(screen.getByLabelText(/what/i), { target: { value: 'Sheet music' } })
    expect((screen.getByLabelText(/category/i) as HTMLSelectElement).value).toBe('equipment')
  })

  it('saves an expense entry', async () => {
    const store = await mount(() => <BoughtSomethingForm onDone={() => {}} />)
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '12.50' } })
    fireEvent.change(screen.getByLabelText(/what/i), { target: { value: 'Piano strings' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(store.getState().entries.filter(e => e.type === 'expense')).toHaveLength(1))
  })

  it('shows large purchase question when amount exceeds threshold', async () => {
    await mount(() => <BoughtSomethingForm onDone={() => {}} />)
    // Default threshold is £500 (50000p), so £600 should trigger it
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '600' } })
    expect(screen.getByText(/Only teaching/i)).toBeInTheDocument()
  })

  it('shows the mileage-instead note for a fuel purchase (C1)', async () => {
    await mount(() => <BoughtSomethingForm onDone={() => {}} />)
    fireEvent.change(screen.getByLabelText(/what/i), { target: { value: 'Shell petrol' } })
    expect(screen.getByText(/claiming mileage instead/i)).toBeInTheDocument()
  })

  it('learns merchant when category is overridden', async () => {
    const store = await mount(() => <BoughtSomethingForm onDone={() => {}} />)
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText(/what/i), { target: { value: 'Mystery vendor' } })
    // Change category from default (uncategorised) to 'professional'
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'professional' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(store.getState().learnedMerchants['mystery vendor']).toBe('professional'))
  })
})

describe('DroveToLessonForm', () => {
  it('shows a calculated amount for a new journey', async () => {
    await mount(() => <DroveToLessonForm onDone={() => {}} />)
    fireEvent.click(screen.getByText(/somewhere new/i))
    fireEvent.change(screen.getByLabelText(/miles/i), { target: { value: '6' } })
    // R5: compute expected amount from real rate, not hardcoded £2.70
    const expected = formatPounds(mileagePence(6, getRates(currentTaxYear())))
    expect(screen.getByText(new RegExp(expected.replace('.', '\\.')))).toBeInTheDocument()
  })

  it('saves a journey entry on save click', async () => {
    const store = await mount(() => <DroveToLessonForm onDone={() => {}} />)
    fireEvent.click(screen.getByText(/somewhere new/i))
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Twickenham' } })
    fireEvent.change(screen.getByLabelText(/miles/i), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      const journeys = store.getState().entries.filter(e => e.type === 'journey')
      expect(journeys).toHaveLength(1)
      expect((journeys[0].details as { destination: string }).destination).toBe('Twickenham')
    })
  })

  it('costs a new journey using the cumulative 10k split (I3)', async () => {
    const storage = createMemoryStorage()
    const store = createStore(storage)
    await store.init()
    const rates = getRates(currentTaxYear())
    const already = 9_990 // year-to-date miles, just under the 10,000 threshold
    const { start } = { start: `${currentTaxYear().slice(0, 4)}-06-01` }
    await store.addEntry({
      date: start,
      type: 'journey',
      amountPence: mileagePence(already, rates),
      description: 'Prior driving / 이전 운전',
      category: 'travel',
      details: { destination: 'Faraway', miles: already, ratePence: rates.mileageHigherPencePerMile },
    })
    render(<StoreProvider store={store}><DroveToLessonForm onDone={() => {}} /></StoreProvider>)
    fireEvent.click(screen.getByText(/somewhere new/i))
    fireEvent.change(screen.getByLabelText(/miles/i), { target: { value: '20' } })
    // 20 more miles: 10 at higher rate (to reach 10k), 10 at lower rate.
    const expected = formatPounds(mileagePence(20, rates, already))
    expect(screen.getByText(new RegExp(expected.replace('.', '\\.')))).toBeInTheDocument()
    // Sanity: the split really is lower than a naive full-higher-rate cost.
    expect(mileagePence(20, rates, already)).toBeLessThan(mileagePence(20, rates, 0))
  })

  it('shows saved-journey buttons from prior journey entries', async () => {
    const storage = createMemoryStorage()
    const store = createStore(storage)
    await store.init()
    await store.addEntry({
      date: '2026-09-01',
      type: 'journey',
      amountPence: 270,
      description: 'Drove to Richmond / Richmond 레슨',
      category: 'travel',
      details: { destination: 'Richmond', miles: 6, ratePence: 45 },
    })
    render(<StoreProvider store={store}><DroveToLessonForm onDone={() => {}} /></StoreProvider>)
    expect(screen.getByText(/Richmond/)).toBeInTheDocument()
  })
})

describe('WorkedFromHomeForm', () => {
  it('shows current hoursPerWeekAtHome', async () => {
    const storage = createMemoryStorage({ settings: { hoursPerWeekAtHome: 30 } as any })
    const store = createStore(storage)
    await store.init()
    render(<StoreProvider store={store}><WorkedFromHomeForm onDone={() => {}} /></StoreProvider>)
    expect((screen.getByLabelText(/hours per week/i) as HTMLInputElement).value).toBe('30')
  })

  it('updates hoursPerWeekAtHome and calls onDone', async () => {
    const store = await mount(() => <WorkedFromHomeForm onDone={() => {}} />)
    fireEvent.change(screen.getByLabelText(/hours per week/i), { target: { value: '40' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(store.getState().settings.hoursPerWeekAtHome).toBe(40))
  })

  it('regenerates home_office entries after saving qualifying hours', async () => {
    const store = await mount(() => <WorkedFromHomeForm onDone={() => {}} />)
    fireEvent.change(screen.getByLabelText(/hours per week/i), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(store.getState().entries.filter(e => e.type === 'home_office')).toHaveLength(12),
    )
  })
})
