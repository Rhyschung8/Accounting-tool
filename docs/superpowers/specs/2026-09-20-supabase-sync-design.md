# Piano Accounts — Design Spec: Supabase Cloud Sync (Plan 4)

**Date:** 2026-09-20
**Status:** Approved design, ready for implementation planning

---

## 1. Purpose

Let the piano teacher use the app on **more than one device** (and, later, her phone) with the same records, by moving her data from local files to a small cloud backend. Her fixes-reach-her hosting is already solved (GitHub Pages); this phase adds shared, synced data behind a simple login.

### What changes for her
- Instead of "pick a folder" on first run, she **signs in once per device** with an email + password Rhys gives her.
- Her records then live in the cloud and are the same on every device she signs into.
- She does nothing else differently — the app looks and works the same after sign-in.

### Success looks like
- She signs in on device A, logs some entries; signs in on device B, sees the same data.
- No one but her (holding her login) can read her data, even though the app is public.
- Rhys can push fixes as before; data is untouched by deploys.

---

## 2. Non-goals

- **Offline-first / conflict resolution.** Online-required for v1. If offline, the app shows a friendly "you're offline" state, not a silent failure or a local queue. (Deliberate simplification — decided with Rhys.)
- **Multi-user / team.** Single user (her). The design is per-user via RLS, so it *could* extend, but that's not built now.
- **Data migration.** She has no existing local data — fresh start. No import path.
- **Self-service signup.** Rhys creates her one account in the dashboard. No public registration UI.
- **Replacing the local adapter's existence.** The `StorageAdapter` interface and the in-memory adapter (for tests) stay. The hosted app uses the new Supabase adapter.

---

## 3. Decisions (locked with Rhys)

| Area | Decision |
|---|---|
| Connectivity | **Online-required** (v1) |
| Receipt photos | Stored in **Supabase Storage** (private bucket) |
| Existing data | **None** — fresh start, no migration |
| Data shape in DB | **One JSONB row per user** = "cloud `data.json`" (not relational tables) |
| Auth | **Email + password**, admin-created single user, session persists per device |
| Keys | **anon public key** only in the app (safe); **`service_role` never** in app/repo |
| Org | Rhys's default/free Supabase org; one project |

---

## 4. Architecture

### 4.1 Overview

```
Her browser (the PWA on GitHub Pages)
  └─ supabase-js client (URL + anon public key)
       ├─ Auth: email+password → session (persisted in browser)
       ├─ Postgres: table `user_data` (one JSONB row = her whole AppData)
       └─ Storage: private bucket `receipts` (her photos, RLS-scoped)
```

The app's logic is unchanged. A new `SupabaseStorageAdapter` implements the existing `StorageAdapter` interface, so the store/domain/UI don't change. A sign-in gate replaces the folder-pick.

### 4.2 Data model — "cloud `data.json`"

One row per user holds the entire `AppData` blob (the same object shape stored locally today: `{ entries, settings, learnedMerchants }`).

```sql
create table public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
```

- **Load** = `select data from user_data where user_id = auth.uid()` (one row).
- **Save** = `upsert` the whole blob on `user_id`.
- Whole-blob save is efficient enough for a piano teacher's dataset (hundreds of rows/year) and maps 1:1 onto the current whole-`AppData` adapter model. Last-write-wins is acceptable for a single user rarely on two devices at once.

### 4.3 Row-Level Security (the actual protection)

RLS is **mandatory** — it, not the anon key, is what keeps data private.

```sql
alter table public.user_data enable row level security;

create policy "own row - select" on public.user_data
  for select using (auth.uid() = user_id);
create policy "own row - insert" on public.user_data
  for insert with check (auth.uid() = user_id);
create policy "own row - update" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

A stranger holding the public anon key but no session gets **zero rows** — RLS denies them.

### 4.4 Receipts — private Storage bucket

- Private bucket `receipts`. Object path convention: `{auth.uid()}/{filename}`.
- Storage RLS policies so a user can only read/write objects under **their own** `{user_id}/` prefix.
- The entry keeps `receiptFile` = the storage path; `readReceiptUrl` returns a **signed URL** (short-lived) to display the photo.

```sql
-- bucket 'receipts' created (private) via dashboard or SQL
create policy "own receipts - all" on storage.objects
  for all using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 4.5 Auth & app boot

- **Email + password.** Rhys creates her user in the Auth dashboard (email confirmed). No signup UI.
- **Boot flow** (hosted / Supabase mode):
  1. App starts → check Supabase session.
  2. **No session** → show a small **Sign-in screen** (email, password, Sign in). On success → step 3.
  3. **Session present** → load her `user_data` blob → run the app exactly as today.
- Session persists via supabase-js (browser storage), so she signs in once per device.
- The **FirstRun folder-pick is removed** in Supabase mode (replaced by sign-in). Settings gains a **Sign out** control.

### 4.6 The adapter seam

`SupabaseStorageAdapter` implements the existing interface:

```ts
interface StorageAdapter {
  load(): Promise<AppData>                      // select the user's jsonb blob (or emptyAppData if none)
  save(data: AppData): Promise<void>            // upsert the blob
  saveReceipt(file: File): Promise<string>      // upload to receipts/{uid}/{name}; return the path
  readReceiptUrl(name: string): Promise<string|null>  // signed URL for the path
}
```

`main.tsx` selects the adapter: **Supabase** when built with the Supabase env vars present (the hosted build); the in-memory adapter remains for tests. (The old File System Access adapter may remain in the tree for local/dev use but is not the hosted path.)

### 4.7 Config & keys

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` supplied at **build time** as GitHub Actions repository **variables** (the anon key is public-safe; using build vars just keeps it out of source).
- The deploy workflow passes them into `npm run build`.
- **`service_role` key and DB password never appear** in the repo, the build, or the client — only ever used by Rhys directly in the Supabase dashboard.

### 4.8 Online / error handling

- On load/save failure due to no connectivity → a calm bilingual "인터넷 연결이 필요해요 / You need to be online to use this" state; retry when back.
- Auth errors (wrong password) → a clear bilingual message on the sign-in screen.
- Never show her a raw error or lose an in-progress entry silently.

---

## 5. Dependencies

- **`@supabase/supabase-js`** (the one new runtime dependency).
- No other backend, server, or framework. Still a static PWA + a hosted Supabase project.

---

## 6. Testing

- **Adapter unit tests** with a **mocked** supabase-js client: `load` maps a returned blob → `AppData`; `save` calls upsert with the blob; `saveReceipt`/`readReceiptUrl` call storage with the right path; missing-row → `emptyAppData()`.
- **Sign-in UI tests** with a mocked auth client: success → app loads; wrong password → error message; sign-out clears session.
- **Store/domain/UI unchanged** → their existing 125 tests keep passing.
- **Live end-to-end is manual** (requires the real project + keys + the SQL run): sign in on two browsers, confirm same data, RLS denies an unauthenticated client, receipts upload/view. Documented as a checklist.

---

## 7. What Rhys must do (dashboard steps — provided as exact instructions)

1. Create a Supabase org (free) + project.
2. Run the provided **SQL** (table + RLS + receipts bucket + storage policies) in the SQL editor.
3. Create **her user** (email + password) in Auth → Users → Add user (email confirmed).
4. Give Claude the **Project URL** + **anon public key** (for the build vars). **Not** the `service_role` key.
5. Share her email + password with her privately.

---

## 8. Requires real-world verification (during/after build)

- The **SQL + RLS + storage policies** must be applied and tested against the real project (an unauthenticated client must get zero rows; a signed-in client sees only her data; receipts scoped to her folder). This is manual, needs the project.
- Confirm the anon key in the built site + RLS behave as designed (no data readable without a session).

---

## 9. Risk & rollback

- **Reversible:** the local File System Access path and the `StorageAdapter` seam remain, so reverting to local-only is a config change, not a rewrite.
- **Data custody:** her financial data now lives in Rhys's Supabase project — Rhys is the custodian (GDPR/backup responsibility). Acceptable per Rhys's decision; noted so it's not a surprise.
- **Single point:** if the Supabase project is deleted/paused (free tier pauses on inactivity), she can't load data until it's back. Mitigation: keep the project active; consider periodic exports.
