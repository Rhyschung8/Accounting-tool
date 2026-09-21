# Piano Accounts — Plan 4: Supabase Cloud Sync

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the teacher's data from local files to a Supabase backend behind an email+password login, so the app works across devices — implemented as a new `SupabaseStorageAdapter` behind the existing `StorageAdapter` seam plus a sign-in gate, with the rest of the app unchanged.

**Architecture:** One JSONB row per user (`user_data.data` = the whole `AppData` blob — "cloud data.json"). A `SupabaseStorageAdapter` implements the existing `StorageAdapter` interface (load=select, save=upsert, receipts=Storage bucket). A top-level auth gate shows a sign-in screen until there's a session, then builds the store with the Supabase adapter and renders the existing app. Online-required; RLS scopes every row/file to the signed-in user.

**Tech Stack:** TypeScript, React 18, Vite, Vitest, `@supabase/supabase-js`. Deployed static on GitHub Pages (unchanged).

**Spec:** `docs/superpowers/specs/2026-09-20-supabase-sync-design.md`

## Global Constraints

- **The `StorageAdapter` interface is fixed** — `load(): Promise<AppData>`, `save(data: AppData): Promise<void>`, `saveReceipt(file: File): Promise<string>`, `readReceiptUrl(name: string): Promise<string|null>`. The Supabase adapter implements it exactly; the store/domain/UI do not change. (Spec §4.6)
- **Money is integer pence; bilingual Korean-first labels; money plain-positive.** (Carried from the app's global rules — any new UI text follows this.)
- **Only the anon public key + Project URL go in the app.** The `service_role` key and DB password never appear anywhere in the repo/build/client. (Spec §4.7, §9)
- **Data privacy is enforced by RLS, not by the key.** The adapter always operates as the signed-in user; a signed-out client must load nothing. (Spec §4.3)
- **Online-required.** On network/auth failure show a calm bilingual message; never lose an in-progress entry silently. (Spec §4.8)
- **The existing 125 tests must stay green.** New Supabase code is unit-tested against a **mocked** `@supabase/supabase-js` client; live end-to-end is manual. (Spec §6)
- **Supabase project:** URL `https://imjlribdwcyycjbrekon.supabase.co`; the SQL (table `user_data` + RLS + `receipts` bucket + storage policy) is already applied; her user exists (`piano@gmail.com`).
- **Node 20+**, Chrome/Edge target.

---

## File Structure

```
src/
  config/supabase.ts          # URL + anon key constants (public-safe) + createClient() singleton
  storage/supabaseStorage.ts  # createSupabaseStorage(client): StorageAdapter
  auth/session.ts             # signIn / signOut / getSession / onAuthChange (thin wrappers)
  ui/SignIn.tsx               # bilingual email+password sign-in screen
  ui/Settings.tsx             # MODIFY: add "로그아웃 / Sign out"; hide local-backup button in cloud mode
  App.tsx                     # MODIFY: accept a `cloud` flag so it skips the folder FirstRun
  main.tsx                    # MODIFY: cloud boot — session gate → SignIn or authed app with Supabase adapter
tests/
  storage/supabaseStorage.test.ts
  auth/session.test.ts
  ui/signIn.test.tsx
  ui/cloudBoot.test.tsx
```

Reused unchanged: `src/storage/storage.ts` (StorageAdapter, AppData, emptyAppData, DEFAULT_SETTINGS), `src/state/store.ts`, `src/state/useStore.tsx`, all domain + UI components, `src/storage/memoryStorage.ts` (tests).

---

### Task 1: Supabase client config

**Files:**
- Create: `src/config/supabase.ts`
- Test: `tests/config/supabase.test.ts`
- Modify: `package.json` (add dependency)

**Interfaces:**
- Produces:
  - `const SUPABASE_URL: string`, `const SUPABASE_ANON_KEY: string`
  - `getSupabase(): SupabaseClient` — returns a lazily-created singleton client (persistent session in browser storage).

- [ ] **Step 1: Install the dependency**

```bash
cd /home/rhyschung/piano-accounts/.worktrees/plan1-core
npm install @supabase/supabase-js
```

- [ ] **Step 2: Write the failing test**

```ts
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
```

- [ ] **Step 3: Run to verify failure**

Run: `npm test -- config/supabase`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement**

```ts
// src/config/supabase.ts
// The anon public key is PUBLIC by design (it ships in the built site).
// Security is enforced by Row-Level Security in Supabase, never by hiding this key.
// NEVER put the service_role key or DB password here.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://imjlribdwcyycjbrekon.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltamxyaWJkd2N5eWNqYnJla29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzUyNDgsImV4cCI6MjEwNTUxMTI0OH0.IZqW1h_UxVEEP9X8fU2uK2gPWoCQnN9A8UdZdvPh_5E'

let client: SupabaseClient | null = null
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return client
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm test -- config/supabase`
Expected: PASS. Then `npm run build` to confirm the new dep bundles cleanly.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/config/supabase.ts tests/config/supabase.test.ts
git commit -m "feat: supabase client config (public anon key)"
```

---

### Task 2: SupabaseStorageAdapter

**Files:**
- Create: `src/storage/supabaseStorage.ts`
- Test: `tests/storage/supabaseStorage.test.ts`

**Interfaces:**
- Consumes: `StorageAdapter`, `AppData`, `emptyAppData`, `DEFAULT_SETTINGS` (storage.ts); a `SupabaseClient`-shaped object.
- Produces: `createSupabaseStorage(client): StorageAdapter`.
  - `load()` → `select data from user_data` for the current user; returns `{ ...emptyAppData(), ...(row.data), settings: { ...DEFAULT_SETTINGS, ...(row.data.settings ?? {}) } }`, or `emptyAppData()` if no row.
  - `save(data)` → `upsert({ user_id, data, updated_at })` on `user_id`.
  - `saveReceipt(file)` → upload to `receipts/{user_id}/{ts-filename}`; return that path.
  - `readReceiptUrl(name)` → signed URL (1h) or null.

- [ ] **Step 1: Write the failing tests** (mocked client)

```ts
// tests/storage/supabaseStorage.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createSupabaseStorage } from '../../src/storage/supabaseStorage'
import { emptyAppData } from '../../src/storage/storage'

function mockClient(opts: { row?: any } = {}) {
  const upsert = vi.fn().mockResolvedValue({ error: null })
  const maybeSingle = vi.fn().mockResolvedValue({ data: opts.row ?? null, error: null })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select, upsert }))
  const upload = vi.fn().mockResolvedValue({ error: null })
  const createSignedUrl = vi.fn().mockResolvedValue({ data: { signedUrl: 'https://signed/x' }, error: null })
  const storageFrom = vi.fn(() => ({ upload, createSignedUrl }))
  const getUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  return {
    client: { from, storage: { from: storageFrom }, auth: { getUser } } as any,
    upsert, upload, createSignedUrl, from, storageFrom,
  }
}

describe('SupabaseStorageAdapter', () => {
  it('load returns emptyAppData when the user has no row yet', async () => {
    const { client } = mockClient({ row: null })
    const a = createSupabaseStorage(client)
    expect(await a.load()).toEqual(emptyAppData())
  })
  it('load merges the stored blob over defaults', async () => {
    const { client } = mockClient({ row: { data: { entries: [{ id: '1' }], settings: { hoursPerWeekAtHome: 30 } } } })
    const a = createSupabaseStorage(client)
    const d = await a.load()
    expect(d.entries).toHaveLength(1)
    expect(d.settings.hoursPerWeekAtHome).toBe(30)
    expect(d.settings.textSize).toBe('large') // default preserved
  })
  it('save upserts the whole blob keyed by user_id', async () => {
    const { client, upsert } = mockClient()
    const a = createSupabaseStorage(client)
    await a.save({ ...emptyAppData(), entries: [{ id: 'x' } as any] })
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', data: expect.objectContaining({ entries: [{ id: 'x' }] }) }),
      expect.objectContaining({ onConflict: 'user_id' }),
    )
  })
  it('saveReceipt uploads under the user folder and returns the path', async () => {
    const { client, upload } = mockClient()
    const a = createSupabaseStorage(client)
    const path = await a.saveReceipt(new File(['x'], 'r.jpg'))
    expect(path).toMatch(/^user-1\/.*r\.jpg$/)
    expect(upload).toHaveBeenCalledWith(path, expect.any(File))
  })
  it('readReceiptUrl returns a signed url', async () => {
    const { client } = mockClient()
    const a = createSupabaseStorage(client)
    expect(await a.readReceiptUrl('user-1/r.jpg')).toBe('https://signed/x')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- supabaseStorage`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/storage/supabaseStorage.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { emptyAppData, DEFAULT_SETTINGS, type AppData, type StorageAdapter } from './storage'

const TABLE = 'user_data'
const BUCKET = 'receipts'

export function createSupabaseStorage(client: SupabaseClient): StorageAdapter {
  async function uid(): Promise<string> {
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) throw new Error('Not signed in')
    return data.user.id
  }

  return {
    async load(): Promise<AppData> {
      const userId = await uid()
      const { data, error } = await client
        .from(TABLE).select('data').eq('user_id', userId).maybeSingle()
      if (error) throw error
      const blob = (data?.data ?? {}) as Partial<AppData>
      return {
        ...emptyAppData(),
        ...blob,
        settings: { ...DEFAULT_SETTINGS, ...(blob.settings ?? {}) },
        learnedMerchants: { ...(blob.learnedMerchants ?? {}) },
      }
    },

    async save(data: AppData): Promise<void> {
      const userId = await uid()
      const { error } = await client.from(TABLE).upsert(
        { user_id: userId, data, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
      if (error) throw error
    },

    async saveReceipt(file: File): Promise<string> {
      const userId = await uid()
      const path = `${userId}/${Date.now()}-${file.name}`
      const { error } = await client.storage.from(BUCKET).upload(path, file)
      if (error) throw error
      return path
    },

    async readReceiptUrl(name: string): Promise<string | null> {
      const { data, error } = await client.storage.from(BUCKET).createSignedUrl(name, 3600)
      if (error) return null
      return data?.signedUrl ?? null
    },
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- supabaseStorage`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/storage/supabaseStorage.ts tests/storage/supabaseStorage.test.ts
git commit -m "feat: SupabaseStorageAdapter (jsonb blob + receipts bucket)"
```

---

### Task 3: Auth module

**Files:**
- Create: `src/auth/session.ts`
- Test: `tests/auth/session.test.ts`

**Interfaces:**
- Consumes: a `SupabaseClient`-shaped object.
- Produces:
  - `signIn(client, email, password): Promise<{ error: string | null }>`
  - `signOut(client): Promise<void>`
  - `getSessionUserId(client): Promise<string | null>`
  - `onAuthChange(client, cb: (signedIn: boolean) => void): () => void` (returns an unsubscribe)

- [ ] **Step 1: Write the failing tests**

```ts
// tests/auth/session.test.ts
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- auth/session`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/auth/session.ts
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- auth/session`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/auth/session.ts tests/auth/session.test.ts
git commit -m "feat: supabase auth session helpers"
```

---

### Task 4: SignIn screen

**Files:**
- Create: `src/ui/SignIn.tsx`
- Test: `tests/ui/signIn.test.tsx`

**Interfaces:**
- Consumes: `signIn` (session.ts), a client.
- Produces: `<SignIn client={client} onSignedIn={() => void} />` — a bilingual email+password form. On submit calls `signIn`; on success calls `onSignedIn`; on failure shows a bilingual error. Online-required note shown calmly.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/signIn.test.tsx
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
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'x' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in|로그인/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- signIn`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/ui/SignIn.tsx
import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { signIn } from '../auth/session'

export function SignIn({ client, onSignedIn }: { client: SupabaseClient; onSignedIn: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await signIn(client, email, password)
    setBusy(false)
    if (error) setError('로그인 정보가 올바르지 않아요 / That email or password isn’t right')
    else onSignedIn()
  }

  return (
    <div className="app-shell signin">
      <h1><span className="lang-ko">로그인</span><span className="lang-en">Sign in</span></h1>
      <form onSubmit={submit} className="signin__form">
        <label>이메일 / Email
          <input aria-label="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />
        </label>
        <label>비밀번호 / Password
          <input aria-label="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? '잠시만 / One moment…' : '로그인 / Sign in'}
        </button>
      </form>
      <p className="signin__note">인터넷 연결이 필요해요 / You need to be online to use this.</p>
    </div>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- signIn`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/SignIn.tsx tests/ui/signIn.test.tsx
git commit -m "feat: bilingual sign-in screen"
```

---

### Task 5: Cloud boot wiring + sign-out

**Files:**
- Modify: `src/main.tsx`, `src/App.tsx`, `src/ui/Settings.tsx`
- Create: `src/ui/CloudApp.tsx` (the auth gate)
- Test: `tests/ui/cloudBoot.test.tsx`

**Interfaces:**
- Consumes: `getSupabase`, `createSupabaseStorage`, `getSessionUserId`, `onAuthChange`, `signOut`, `createStore`, `SignIn`, `App`.
- Produces:
  - `<CloudApp client={client} />` — on mount checks the session; **no session → `<SignIn>`**; **session → build store with `createSupabaseStorage(client)`, `store.init()`, render `<App store={store} cloud />`.** Re-renders on auth change.
  - `App` gains a `cloud?: boolean` prop; when `cloud`, it does **not** gate on `folderChosen` (there is no folder) — it renders the main UI directly.
  - `Settings` gains a **"로그아웃 / Sign out"** button (calls `signOut` then reloads) and **hides the local "Back up my records" button when `cloud`** (cloud data is backed up by Supabase). Pass a `cloud` prop down from `App`/`HomeScreen`, or read a module flag — simplest: a `cloud` prop threaded to Settings.

- [ ] **Step 1: Write the failing test** (gate behaviour with a mocked client)

```tsx
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- cloudBoot`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/ui/CloudApp.tsx`:

```tsx
// src/ui/CloudApp.tsx
import { useEffect, useState } from 'react'
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

  async function boot() {
    const uid = await getSessionUserId(client)
    if (!uid) { setState('signedOut'); return }
    const s = createStore(createSupabaseStorage(client))
    await s.init()
    setStore(s)
    setState('ready')
  }

  useEffect(() => {
    boot()
    const unsub = onAuthChange(client, () => boot())
    return unsub
  }, [])

  if (state === 'loading') return <div className="app-shell" aria-busy="true" />
  if (state === 'signedOut' || !store) return <SignIn client={client} onSignedIn={boot} />
  return <App store={store} cloud client={client} />
}
```

Modify `App.tsx`: accept `cloud?: boolean` and `client?` props; when `cloud`, render the main app UI without the `folderChosen` FirstRun gate (there is no folder to pick). Thread `cloud`/`client` to the Settings screen (via HomeScreen) so Settings can show Sign out and hide the local backup button. Keep the existing non-cloud path intact and keep injecting `store` for tests.

Modify `src/ui/Settings.tsx`: add a **"로그아웃 / Sign out"** button (Korean-first) that calls `signOut(client)` then `location.reload()`, shown only when `cloud`; and hide the existing local "내 기록 백업 / Back up my records" button when `cloud`.

Modify `src/main.tsx`: replace the local-adapter boot with `createRoot(...).render(<CloudApp client={getSupabase()} />)` (still importing `./styles.css` and registering the service worker). Remove the File System Access folder-pick boot path.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- cloudBoot signIn` then FULL `npm test` (all prior 125 + new pass) and `npm run build`.
Expected: PASS + clean build. If any existing App/homeScreen test breaks because of the new `cloud`/prop threading, update the test to render the component it targets with the props it needs — never change visible text.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx src/App.tsx src/ui/Settings.tsx src/ui/CloudApp.tsx tests/ui/cloudBoot.test.tsx
git commit -m "feat: cloud auth gate — sign-in boots the app on Supabase storage"
```

---

### Task 6: Manual verification (live) + docs

**Files:**
- Create: `docs/supabase-verification.md`
- Test: manual (live Supabase — cannot run headless/unit)

**Interfaces:** none (documentation + live check).

- [ ] **Step 1: Build & deploy path check**

Run `npm run build`; confirm the bundle includes the Supabase client and `dist/index.html` still uses relative paths (host-agnostic). The existing GitHub Pages workflow deploys on merge to `main` — no workflow change needed (config is committed, no env vars).

- [ ] **Step 2: Write the manual checklist** to `docs/supabase-verification.md` (to run in Chrome/Edge against the live site once merged):

- [ ] Open the site → it shows the **Sign in** screen (not a folder picker).
- [ ] Wrong password → friendly error; correct (`piano@gmail.com` + the password) → lands on the home dashboard.
- [ ] Log an income entry → reload the page → it's still there (persisted to Supabase).
- [ ] Open the site in a **second browser/device**, sign in → the same entry is there (multi-device works).
- [ ] Attach a receipt photo → it uploads; the row shows the receipt pill; the photo displays (signed URL).
- [ ] In Supabase → Table Editor → `user_data` → one row for her user, `data` holds the JSON.
- [ ] **RLS check:** in an incognito window (signed out), the app shows Sign in and loads nothing.
- [ ] Settings → **Sign out** → returns to the Sign in screen.
- [ ] Offline (dev tools → offline) → a calm "you need to be online" message, no crash.

- [ ] **Step 3: Commit**

```bash
git add docs/supabase-verification.md
git commit -m "docs: Supabase live verification checklist"
```

---

## Self-Review

**Spec coverage:**
- §4.2 JSONB-per-user model → Task 2 (load/save) ✓
- §4.3 RLS (enforced server-side; adapter operates as signed-in user) → Tasks 2, 5; live check Task 6 ✓
- §4.4 receipts in Storage bucket, per-user path, signed URLs → Task 2 ✓
- §4.5 email+password auth, sign-in gate replacing folder pick, sign-out → Tasks 3, 4, 5 ✓
- §4.6 StorageAdapter seam, app unchanged → Task 2 implements the interface; Task 5 swaps it in ✓
- §4.7 anon key only, committed (public-safe), never service_role → Task 1 ✓
- §4.8 online-required, calm errors → Task 4 note + Task 5; live check Task 6 ✓
- §5 `@supabase/supabase-js` dependency → Task 1 ✓
- §6 mocked-client unit tests, existing 125 green, live manual → Tasks 2–5 + Task 6 ✓
- §7 setup steps → done by Rhys already (SQL run, user created, keys provided) ✓
- §8 live RLS/keys verification → Task 6 ✓

**Placeholder scan:** No TBD/"handle errors" left; adapter/auth/config carry full code; UI/boot carry full code plus explicit prop-threading instructions and runnable tests.

**Type consistency:** `StorageAdapter` (load/save/saveReceipt/readReceiptUrl), `AppData`, `createSupabaseStorage`, `signIn`/`signOut`/`getSessionUserId`/`onAuthChange`, `CloudApp`, `App` `cloud` prop — names/signatures consistent across tasks. `user_data` table/columns match the applied SQL (`user_id`, `data`, `updated_at`).

**Note on the local path:** the File System Access adapter + FirstRun folder pick remain in the tree but are no longer the hosted boot path (Task 5 points `main.tsx` at `CloudApp`). This keeps the revert-to-local option available (spec §9) without deleting working code; unused exported modules are not a lint error.
