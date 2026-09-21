// tests/ui/cloudBoot.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CloudApp } from '../../src/ui/CloudApp'

function client(signedIn: boolean) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: signedIn ? { id: 'u1' } : null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
    },
    from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }), upsert: vi.fn().mockResolvedValue({ error: null }) })),
    storage: { from: vi.fn() },
  } as any
}

describe('CloudApp gate', () => {
  it('shows the sign-in screen when there is no session', async () => {
    render(<CloudApp client={client(false)} />)
    await waitFor(() => expect(screen.getByRole('button', { name: /sign in|로그인/i })).toBeInTheDocument())
  })
  it('shows the app (a home action button) when signed in', async () => {
    render(<CloudApp client={client(true)} />)
    await waitFor(() => expect(screen.getByText(/I got paid/)).toBeInTheDocument())
  })
})
