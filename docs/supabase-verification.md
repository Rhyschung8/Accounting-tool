# Supabase Live Verification Checklist

**Site:** https://rhyschung8.github.io/Accounting-tool/  
**Login:** `piano@gmail.com` + (password set by Rhys)

This checklist verifies that the Supabase cloud-sync integration is working end-to-end: authentication, data persistence, multi-device sync, receipt upload/download, RLS enforcement, and offline handling.

## Manual Tests (Chrome/Edge)

- [ ] **Sign-in screen on load** — Open the site; verify it shows a Sign in form (not a folder picker or direct access to the app).

- [ ] **Authentication** — Enter the wrong password; confirm a friendly error message. Then sign in with the correct credentials (`piano@gmail.com` + password); confirm you land on the home dashboard.

- [ ] **Data persistence** — Log an income entry. Reload the page. Verify the entry is still there (persisted to Supabase).

- [ ] **Multi-device sync** — Open the site in a second browser or device, sign in with the same account. Verify the income entry from step 3 appears (Supabase has synced it across devices).

- [ ] **Receipt upload & view** — Attach a receipt photo to an entry. Verify:
  - The file uploads without error.
  - The entry row shows a receipt pill/indicator.
  - Clicking the receipt displays the photo (via Supabase Storage signed URL).

- [ ] **Supabase table check** — In Supabase Console, go to Table Editor → `user_data` table. Verify:
  - One row exists for her user ID (`user_id` column).
  - The `data` column contains the JSON payload (income entries, settings, etc.).

- [ ] **RLS enforcement (signed out)** — In an incognito window (no login session), open the site. Verify:
  - The Sign in screen appears.
  - No data loads (RLS blocks unsigned queries).

- [ ] **Sign out** — On the dashboard, go to Settings → Sign out. Verify you return to the Sign in screen.

- [ ] **Offline handling** — Open dev tools → Network → go offline. Trigger an action (e.g., create an entry). Verify:
  - A calm "you need to be online" message appears (no crash, no blank state).
  - The UI remains responsive and legible.
