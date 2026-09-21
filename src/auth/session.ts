import type { SupabaseClient } from '@supabase/supabase-js'

export async function signIn(client: SupabaseClient, email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await client.auth.signInWithPassword({ email, password })
  return { error: error ? error.message : null }
}

export async function signOut(client: SupabaseClient): Promise<void> {
  await client.auth.signOut()
}

export async function getSessionUserId(client: SupabaseClient): Promise<string | null> {
  const { data } = await client.auth.getUser()
  return data.user?.id ?? null
}

export function onAuthChange(client: SupabaseClient, cb: (signedIn: boolean) => void): () => void {
  const { data } = client.auth.onAuthStateChange((_event, session) => cb(!!session))
  return () => data.subscription.unsubscribe()
}
