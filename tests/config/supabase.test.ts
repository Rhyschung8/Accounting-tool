// tests/config/supabase.test.ts
import { describe, it, expect } from 'vitest'
import { SUPABASE_URL, SUPABASE_ANON_KEY, getSupabase } from '../../src/config/supabase'

describe('supabase config', () => {
  it('exposes the project url and an anon (not service_role) key', () => {
    expect(SUPABASE_URL).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co$/)
    // decode the JWT payload and confirm role: anon
    const payload = JSON.parse(atob(SUPABASE_ANON_KEY.split('.')[1]))
    expect(payload.role).toBe('anon')
  })
  it('returns a singleton client', () => {
    expect(getSupabase()).toBe(getSupabase())
  })
})
