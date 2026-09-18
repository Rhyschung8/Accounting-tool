// tests/ui/homeScreen.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { HomeScreen } from '../../src/ui/HomeScreen'

async function renderHomeScreen() {
  const store = createStore(createMemoryStorage())
  await store.init()
  render(<StoreProvider store={store}><HomeScreen /></StoreProvider>)
  return store
}

describe('HomeScreen', () => {
  it('shows the four action buttons', async () => {
    await renderHomeScreen()
    expect(screen.getByText(/I got paid/)).toBeInTheDocument()
    expect(screen.getByText(/I bought something/)).toBeInTheDocument()
    expect(screen.getByText(/I drove to a lesson/)).toBeInTheDocument()
    expect(screen.getByText(/I worked from home/)).toBeInTheDocument()
  })

  it('renders the tax-year selector', async () => {
    await renderHomeScreen()
    const select = screen.getByRole('combobox', { name: /tax year/i })
    expect(select).toBeInTheDocument()
  })

  it('shows the CSV export button', async () => {
    await renderHomeScreen()
    expect(screen.getByText(/Export CSV/)).toBeInTheDocument()
  })

  it('shows nav links to See everything, Recently deleted, and Settings', async () => {
    await renderHomeScreen()
    expect(screen.getByText(/See everything/)).toBeInTheDocument()
    expect(screen.getByText(/Recently deleted/)).toBeInTheDocument()
    expect(screen.getByText(/Settings/)).toBeInTheDocument()
  })

  it('opens the GotPaid form in a modal and closes on done', async () => {
    await renderHomeScreen()
    const btn = screen.getByText(/I got paid/)
    await act(async () => { btn.click() })
    await waitFor(() => expect(screen.getByText(/Someone new/i)).toBeInTheDocument())
  })
})
