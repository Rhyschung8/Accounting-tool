# Piano Accounts — Manual Verification Checklist

**Why this exists:** most of the app is covered by 130 automated tests, but a few things can only be checked in a real browser on a real computer — installing the app, choosing a folder, saving receipt photos, downloading the CSV, and backing up. Those use the browser's File System Access API, which doesn't run in the automated test environment (or on the Raspberry Pi headlessly).

**What you need:** the teacher's **Windows** laptop, with **Microsoft Edge** or **Google Chrome** (both are fine; Edge comes pre-installed on Windows). Firefox and Safari won't work — they don't support saving to a folder.

**How to open the app for testing:**
- If it's been deployed: just visit the app's URL in Edge/Chrome.
- To test the current build locally: in the project folder run `npm run build` then `npm run preview`, and open the `http://localhost:...` URL it prints.

Tick each box. If anything doesn't behave as described, note it and send it back.

---

## 1. Install & first run
- [ ] An **install icon** appears in the address bar (or a menu "Install" option). Installing opens the app in its **own window** with no address bar.
- [ ] On first launch it shows the **welcome / first-run** screens (bilingual Korean + English).
- [ ] It asks you to **choose a folder** to keep records. Pick a folder (e.g. `Documents\피아노 회계`). After choosing, a **`data.json`** file appears in that folder.
- [ ] You can set **roughly how many hours a week** you work at home, and whether you have **other income** — and skip either if you want.

## 2. Logging money in / out
- [ ] **"돈 받았어요 / I got paid"** → add a payment (e.g. £30 from "Emma"). It appears in the list.
- [ ] Go back into **I got paid** — a **one-tap button for that payer** now shows (e.g. "Emma £30"). Tapping it logs another payment with no typing.
- [ ] **"뭔가 샀어요 / I bought something"** with description **"Sheet music"** → the category is auto-suggested as **Equipment & materials**.
- [ ] Buy something with a fuel description (e.g. **"Shell petrol"**) → it shows the note **"마일리지로 청구되므로 따로 계산되지 않아요 / You're claiming mileage instead, so this one isn't counted separately"**, and it is **not** counted as an expense.
- [ ] Enter a **large purchase** (over £500, e.g. a piano) → it asks whether it's **only for teaching or also personal**, and lets you pick a share.

## 3. Journeys & home office
- [ ] **"레슨하러 운전했어요 / I drove to a lesson"** → enter miles (e.g. 6). It shows a **calculated amount** ("we worked this out for you") and offers to **save the journey**.
- [ ] Re-open **I drove to a lesson** — the **saved journey** shows as a one-tap button.
- [ ] Setting **home-office hours** in Settings generates **monthly home-office entries** that appear in the list, labelled **자동 / auto**.

## 4. Editing & safety
- [ ] Tap any entry → you can **edit** its date, amount, description, category.
- [ ] **Delete** an entry → an **Undo (되돌리기)** appears and restores it; the entry also shows in **Recently deleted (최근 삭제)** where you can restore it.
- [ ] Change an entry's **date to a different tax year** → it moves to the correct year (the tax-year selector reflects it).
- [ ] Text always shows as **plain positive money** — no red, no minus signs.

## 5. Summary & tax estimate
- [ ] The home screen shows **Money in / Money out / What's left** and an **Estimated tax** with the caveat that it's an estimate, not the final bill.
- [ ] Switching the **tax year** updates the figures.
- [ ] If costs exceed income, it shows a **calm loss message**, not a scary negative number.

## 6. Year-end & filing (Plan 2)
- [ ] **"연말 정산 / Year-end & filing"** opens the year-end screen with a **tax-year selector**.
- [ ] The **filing walkthrough** lists the HMRC boxes with **your numbers** next to them: **box 9** turnover, **box 20** total expenses, **box 21** net profit (or **box 22** net loss shown calmly with a carry-forward note).
- [ ] **Before-you-file checklist** flags: months with no income, entries still "needs checking", large purchases without a receipt, and whether home office is confirmed.
- [ ] **Nudges** appear when they apply — e.g. "you need to file", State Pension (with the ~£3.50/week Class 2 figure), trading-allowance comparison, and — if you set **"spouse is a basic-rate taxpayer"** in Settings — **Marriage Allowance**.
- [ ] **"알아두기 / Good to know"** shows the guidance topics + glossary, each with a GOV.UK link and the **"general information, not tax advice"** disclaimer.

## 7. Receipts, export, backup
- [ ] Attach a **receipt photo** to an expense → a file appears in the **`receipts/`** folder next to `data.json`.
- [ ] **Export CSV** → a file downloads and opens cleanly in Excel. Check it has the columns **Date, Type, Description, Category, Amount, Claimable, Receipt, HMRC box** (income rows show box **9**, claimable expenses show box **20**).
- [ ] **"내 기록 백업 / Back up my records"** → writes a backup copy; a dated file appears in the **`backups/`** folder.

## 8. Persistence & comfort
- [ ] **Close and reopen** the app → all your data reloads from the folder (nothing lost).
- [ ] The **text-size** control (normal / large / very large) visibly changes the size.
- [ ] Try **printing** the year-end / filing page — it lays out cleanly on paper.

---

**If everything above ticks:** the app is verified end-to-end on a real machine and ready for her to use for the year. Keep a copy of the records folder (or a USB backup) — those files are her five-year HMRC record.
