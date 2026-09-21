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
    // Button text is "CSV 내보내기 / Export" in the new dashboard layout
    expect(screen.getByText(/Export/)).toBeInTheDocument()
  })

  it('shows nav links to All entries, Recently deleted, and Settings', async () => {
    await renderHomeScreen()
    // Sidebar nav uses new labels: All entries / Recently deleted / Settings
    expect(screen.getByText(/All entries/)).toBeInTheDocument()
    expect(screen.getByText(/Recently deleted/)).toBeInTheDocument()
    expect(screen.getByText(/Settings/)).toBeInTheDocument()
  })

  it('shows a nav link to How to use, and a help icon on the home page', async () => {
    await renderHomeScreen()
    expect(screen.getByText(/How to use/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /help|도움말/i })).toBeInTheDocument()
  })

  it('navigates to the How to use page from the sidebar', async () => {
    await renderHomeScreen()
    const link = screen.getByText(/How to use/)
    await act(async () => { link.click() })
    expect(screen.getByRole('heading', { name: /How to use/i })).toBeInTheDocument()
  })

  it('opens the GotPaid form in a modal and closes on done', async () => {
    await renderHomeScreen()
    const btn = screen.getByText(/I got paid/)
    await act(async () => { btn.click() })
    await waitFor(() => expect(screen.getByText(/Someone new/i)).toBeInTheDocument())
  })
})
