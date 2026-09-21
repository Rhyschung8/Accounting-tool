import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignIn } from '../../src/ui/SignIn'

function client(ok: boolean) {
  return { auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: ok ? null : { message: 'Invalid login credentials' } }) } } as any
}

describe('SignIn', () => {
  it('calls onSignedIn on success', async () => {
    const onSignedIn = vi.fn()
    render(<SignIn client={client(true)} onSignedIn={onSignedIn} />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'piano@gmail.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in|로그인/i }))
    await waitFor(() => expect(onSignedIn).toHaveBeenCalled())
  })
  it('shows an error on bad credentials', async () => {
    render(<SignIn client={client(false)} onSignedIn={() => {}} />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in|로그인/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})
