// src/config/supabase.ts
// The anon public key is PUBLIC by design (it ships in the built site).
// Security is enforced by Row-Level Security in Supabase, never by hiding this key.
// NEVER put the service_role key or DB password here.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://imjlribdwcyycjbrekon.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltamxyaWJkd2N5eWNqYnJla29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzUyNDgsImV4cCI6MjEwNTUxMTI0OH0.IZqW1h_UxVEEP9X8fU2uK2gPWoCQnN9A8UdZdvPh_5E'

export const CLOUD_MODE = true

let client: SupabaseClient | null = null
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return client
}
