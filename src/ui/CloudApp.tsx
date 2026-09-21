// src/ui/CloudApp.tsx
// P4: auth gate — checks session on mount; shows SignIn or the main App.
// P4-R2: CloudApp does NOT call store.init() — App owns that (via its useEffect).
import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createStore } from '../state/store'
import { createSupabaseStorage } from '../storage/supabaseStorage'
import { getSessionUserId, onAuthChange } from '../auth/session'
import { SignIn } from './SignIn'
import { App } from '../App'

type State = 'loading' | 'signedOut' | 'ready'

export function CloudApp({ client }: { client: SupabaseClient }) {
  const [state, setState] = useState<State>('loading')
  const [store, setStore] = useState<ReturnType<typeof createStore> | null>(null)
  const bootId = useRef(0)

  async function boot() {
    const id = ++bootId.current
    const uid = await getSessionUserId(client)
    if (id !== bootId.current) return
    if (!uid) { setState('signedOut'); return }
    if (id !== bootId.current) return
    const s = createStore(createSupabaseStorage(client))
    if (id !== bootId.current) return
    // P4-R2: do NOT call s.init() here — App's useEffect does it
    setStore(s)
    setState('ready')
  }

  useEffect(() => {
    boot()
    const unsub = onAuthChange(client, () => boot())
    return () => { bootId.current++; unsub() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state === 'loading') return <div className="app-shell" aria-busy="true" />
  if (state === 'signedOut' || !store) return <SignIn client={client} onSignedIn={boot} />
  return <App store={store} cloud />
}
