import { describe, it, expect, vi } from 'vitest'
import { signIn, getSessionUserId } from '../../src/auth/session'

describe('auth session', () => {
  it('signIn returns no error on success', async () => {
    const client = { auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: null }) } } as any
    expect(await signIn(client, 'a@b.c', 'pw')).toEqual({ error: null })
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.c', password: 'pw' })
  })
  it('signIn surfaces a friendly error on failure', async () => {
    const client = { auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: { message: 'Invalid login credentials' } }) } } as any
    const r = await signIn(client, 'a@b.c', 'bad')
    expect(r.error).toMatch(/invalid/i)
  })
  it('getSessionUserId returns the id when signed in, null otherwise', async () => {
    const signedIn = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) } } as any
    const signedOut = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) } } as any
    expect(await getSessionUserId(signedIn)).toBe('u1')
    expect(await getSessionUserId(signedOut)).toBeNull()
  })
})
