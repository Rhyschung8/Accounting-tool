# Piano Accounts — Design Spec

**Date:** 2026-09-17
**Status:** Approved design, ready for implementation planning

---

## 1. Purpose

A self-employed piano teacher in the UK needs to keep records of her income and
expenses and file a Self Assessment tax return each year. She has no finance or
accounting background, no bookkeeping software, and no intention of paying an
accountant.

This app keeps her records for her and, at the end of the tax year, hands her a
short list of numbers and tells her exactly where each one goes on HMRC's
website.

### The user

- Self-employed sole trader, piano teacher, UK
- Korean, in her 50s or 60s; reads Korean more comfortably than English
- No finance, accounting, or technical background
- Windows laptop, single device
- Expected profit below the personal allowance, so her tax will usually be £0
- Likely to buy a piano for teaching — a single large purchase that may create a
  loss year

### Success looks like

- In a normal week she opens the app and taps two buttons
- She never types the words "turnover", "profit", or "expenses" to use it
- At year end she files her own return in about twenty minutes, from a printed
  page, without help
- She is still using it in year two

---

## 2. Non-goals

These are deliberately out of scope. Adding any of them changes the project.

- **Filing on her behalf.** No HMRC API, no Making Tax Digital submission. The
  app produces numbers; she types them in. MTD for Income Tax only applies above
  £20,000 of self-employment income, so it does not affect her.
- **Invoicing or debt chasing.** No "who owes me money", no invoice generation.
- **Pupil or lesson management.** Recent payers are remembered as a typing
  shortcut, not as a managed pupil list.
- **Accounts, cloud sync, or multi-device.** One computer, local files.
- **Accruals accounting, VAT, payroll, or multiple businesses.**
- **Personalised tax advice.** The app gives general information with links to
  GOV.UK. It says so.

---

## 3. Decisions

| Area | Decision |
|---|---|
| App shape | Action-first — four plain-language buttons; ledger one tap away |
| Language | Korean and English shown together on every label |
| Income | One row per payment received |
| Travel | Flat-rate mileage; fuel purchases detected and excluded |
| Home office | HMRC flat monthly rate, filled in automatically |
| Large purchases | Business-use share asked only above a threshold |
| Tax estimate | Rates in a dated config file; contextual nudges |
| Year end | Bilingual box-by-box filing walkthrough, plus CSV |
| Bank import | Defaults to "not business"; promotes confident rows; undoable |
| Storage | Real files in a user-chosen folder, plus auto-backup |
| Platform | Installable web app (PWA), Windows, Chrome/Edge |
| Stack | TypeScript + React + Vite; data as a single readable JSON file |

---

## 4. User experience

### 4.1 Home screen

Top third: a calm summary for the current tax year, in large type.

```
수입 / Money in          £8,420
지출 / Money out         £1,930
남은 돈 / What's left    £6,490

예상 세금 / Estimated tax: £0
This is an estimate to help you plan — not your final bill.
```

Below it, four large buttons with icons and both languages:

- 💷 **돈 받았어요 / I got paid**
- 🧾 **뭔가 샀어요 / I bought something**
- 🚗 **레슨하러 운전했어요 / I drove to a lesson**
- 🏠 **집에서 일했어요 / I worked from home**

Then quieter links: **전체 내역 / See everything**, **은행 내역 불러오기 /
Import from my bank**, **알아두기 / Good to know**, **설정 / Settings**.

Money is always shown as plain positive numbers. No red, no minus signs, no
parentheses — those read as "you did something wrong".

### 4.2 The four entry forms

Each asks only what it needs.

**I got paid.** Opens on one-tap repeat buttons for recent payers
(`박선생님 £30`, `Emma £25`). One tap logs today's payment at that amount. A
"someone new" option asks date, amount, and who from (optional).

**I bought something.** Date, amount, what it was. Category is auto-suggested
and overridable. If the amount exceeds the large-purchase threshold (see §7.3),
one extra question appears about business-use share.

**I drove to a lesson.** Opens on saved journeys (`Mrs Patel — 6 miles`). One
tap logs today's trip and shows the calculated amount: *"£2.70 — we worked this
out for you"*. A "somewhere new" option asks where to and how many miles, then
offers to save it.

**I worked from home.** Normally never needed — home office is filled in
automatically from her setup answer (§7.2). This button lets her change the
hours or correct a month.

### 4.3 See everything

The full list for a tax year, newest first, grouped by month. Shows date,
description, category, amount, and whether a receipt is attached. Filters by
tax year and by type. Every row is tappable to edit.

Automatically generated home-office entries appear here like anything else,
clearly labelled — never hidden.

### 4.4 Guided first run

Three friendly screens, skippable, big buttons:

1. Where shall we keep your records? (folder picker)
2. Roughly how many hours a week do you work at home?
3. Do you have any other income besides teaching?

### 4.5 Comfort settings

- Text size: normal / large / very large
- High contrast by default
- Large tap targets throughout
- Everything printable

---

## 5. Data model

### 5.1 One list, not four

Every entry — payment, purchase, journey, home-office month — is one object in
a single `entries` array, sharing the same core fields:

| Field | Notes |
|---|---|
| `id` | Stable unique id |
| `date` | ISO date string, `YYYY-MM-DD` |
| `type` | `income` \| `expense` \| `journey` \| `home_office` |
| `amountPence` | Integer pence. The claimable amount. |
| `description` | Free text, English or Korean |
| `category` | Category key, or `uncategorised` |
| `source` | `manual` \| `import` \| `auto` |
| `importBatchId` | Present only for imported rows |
| `receiptFile` | Filename in `receipts/`, or null |
| `claimable` | Boolean. False for detected fuel purchases. |
| `deletedAt` | Soft delete timestamp, or null |
| `createdAt` | Timestamp |
| `details` | Type-specific extras |

Type-specific `details`:

- `journey`: `{ destination, miles, ratePence }` — carries `category: travel`
- `home_office`: `{ month, hoursPerWeek, bandPence }`
- `expense`: `{ fullAmountPence, businessSharePercent }` when apportioned

Every feature in this spec — summary totals, tax-year filter, CSV export, HMRC
boxes — is a query over this one list. Separate tables per type would mean
four-way joins for all of them.

### 5.2 Money

Stored as **integer pence**, never decimals. Formatted for display only.
Decimal storage produces totals that fail to add up by a penny, which on a tax
document destroys trust in the tool.

### 5.3 Tax year

**Calculated, never stored.** A date from 6 April to the following 5 April
belongs to that tax year. Computing on demand means a mistyped date she later
corrects moves to the right year automatically.

### 5.4 Files on disk

In the folder she picks:

```
피아노 회계/
  data.json          ← all entries, settings, learned merchants
  receipts/          ← receipt and invoice photos, PDFs
  backups/           ← automatic weekly copies of data.json
```

`data.json` is human-readable. If this project vanished, her records remain
openable in Notepad and loadable into Excel. No lock-in.

### 5.5 Deletion and undo

Deleting sets `deletedAt` rather than removing the object. Deleted entries are
excluded from all totals but appear in **최근 삭제 / Recently deleted**, where
she can restore them. An immediate inline **되돌리기 / Undo** appears after
every destructive action.

### 5.6 Import batches

Each import is tagged with a batch id so a bad import is undone in one action
rather than deleting rows individually.

---

## 6. Categorisation

### 6.1 Categories

| Key | Bilingual label |
|---|---|
| `travel` | 교통비 / Travel |
| `equipment` | 악기·교재 / Equipment & materials |
| `professional` | 회비·보험 / Professional fees & insurance |
| `marketing` | 홍보 / Marketing |
| `home_office` | 재택근무 / Working from home |
| `training` | 교육·연수 / Training & CPD |
| `uncategorised` | 확인 필요 / Needs checking |

### 6.2 Matching

Case-insensitive substring match against a keyword list per category. **First
match wins**, in a defined category order. Falls back to `uncategorised`.

Each category carries **two keyword sets**:

- **English** — for bank statement descriptions, which are always English
- **Korean** — for descriptions she types herself

Keywords and categories live in an editable config file, not in code.

### 6.3 The fuel / mileage conflict

**This is a correctness requirement, not a nicety.** HMRC does not permit
claiming both flat-rate mileage and fuel costs for the same vehicle. Because
this app uses flat-rate mileage, fuel purchases must not be claimed.

Fuel keywords (`petrol`, `fuel`, `diesel`, `shell`, `bp`, `esso`, `texaco`,
`morrisons fuel`, …) are matched and the entry is stored with
`claimable: false`, shown with:

> *"You're claiming mileage instead, so this one isn't counted separately."*

The rate is never hardcoded into interface text — any message quoting a
pence-per-mile figure reads it from the tax-year config.

It stays visible so she is never confused about where it went.

Parking, train, and bus fares **are** claimable alongside mileage and remain
normal `travel` expenses.

### 6.4 Learned merchants

When she overrides a suggested category, the merchant string is stored against
the chosen category. Future matches on that merchant use her choice, ahead of
keyword matching. For bank statements dominated by the same twenty merchants,
this is the difference between a five-minute review and an hour.

---

## 7. Calculation rules

### 7.1 Mileage

Flat rate per business mile, first 10,000 miles at the higher rate, lower rate
thereafter. Rates come from the tax-year config. The app shows her the
calculated amount at entry time so she never does the arithmetic.

### 7.2 Working from home

HMRC's flat monthly amount, banded by hours worked from home per month. She
answers "roughly how many hours a week?" once during setup; the app generates a
`home_office` entry for every month of the tax year automatically, with
`source: auto`.

Generated entries are fully editable and deletable like any other. She confirms
once a year rather than remembering monthly.

### 7.3 Large purchases and business-use share

Above a configurable threshold (default £500), the purchase form asks:

> *"Will you use this for anything besides teaching?"*
> **Only teaching** / **Also personal** → *"Roughly what share is teaching?"*
> (25 / 50 / 75 / 100 buttons)

Both the full price and the claimed share are stored, so the audit trail is
honest. The app prompts her to photograph the receipt for anything large.

Under cash basis, equipment such as a piano is deducted in full in the year of
purchase (at the business-use share), not spread over years.

### 7.4 Tax estimate

Profit = claimable income − claimable expenses.

Any "other income" from settings is stacked **beneath** her profit so the
personal allowance is consumed in the correct order, then income tax bands and
Class 4 National Insurance are applied from the tax-year config.

Displayed everywhere as: *추정치 / Estimate — to help you plan, not your final
bill.*

### 7.5 Loss years

Profit below zero is displayed calmly and in plain language, not as a red
negative. The app explains that a loss can usually be carried forward against
next year's teaching profit, and that this is the one situation worth a single
conversation with an accountant.

### 7.6 Contextual nudges

Shown only when her actual figures make them relevant:

- **State Pension.** If profit falls below the small profits threshold, she does
  not receive an automatic National Insurance credit and may wish to pay
  voluntary Class 2 contributions to keep the year counting toward her State
  Pension.
- **You still have to file.** A £0 estimate is not permission to ignore January.
  Once teaching income passes £1,000 she must register and submit.
- **Trading allowance.** If total expenses are below £1,000, claiming the flat
  £1,000 trading allowance instead may be better. The app computes both and says
  which wins.
- **Marriage Allowance.** If her income is below the personal allowance and she
  has a basic-rate-taxpayer spouse, she can transfer part of her unused
  allowance — worth roughly £250 a year and backdatable four years. For this
  user specifically, likely the most valuable thing the app can tell her.

---

## 8. Bank statement import

### 8.1 The real problem

Her statement is a **personal** current account. Three months is perhaps 250
rows of which 30 matter. An import screen that makes her dismiss 220 irrelevant
lines is worse than typing.

### 8.2 Inverted default

Every imported row arrives marked **not business**. The app then *promotes* rows
it is confident about:

- Matches a category keyword
- Matches a learned merchant
- Is an incoming payment (likely a lesson fee)

She reviews a short list of confident rows. Below it, a collapsed **나머지 /
Everything else (218 items)** she can open and pick from.

### 8.3 Formats

Built-in column profiles for common UK banks — Barclays, Lloyds, HSBC, NatWest,
Santander, Nationwide, Halifax, Monzo, Starling — detected from the header row.

Unrecognised format → a short mapping step showing her actual data and asking
three questions: which column is the date, the description, the amount. Her
answer is saved so she is never asked again.

Must handle: differing date formats, separate money-in/money-out columns versus
a single signed column, and quoted fields containing commas.

### 8.4 Safety

- **Duplicate detection** on date + amount + description. Importing March twice
  is the most common mistake.
- **Nothing saves until she presses confirm.** The review screen is a preview.
- **One-action undo** of the whole batch afterwards.

---

## 9. Year-end output

### 9.1 Filing walkthrough

Not a generic guide — a walkthrough **with her numbers already in it**,
bilingual and printable:

> **Step 4 — It asks: "What was your turnover?"**
> Type: **£8,420**
> *This means all the money your pupils paid you this year.*

Covers registering, logging in, each screen in order, each number to type,
pressing submit, and what happens afterwards.

### 9.2 Category → HMRC box mapping

Her six categories map onto numbered boxes of the self-employment pages
(SA103S). **This mapping must be verified against the current HMRC form and
notes — it is not to be written from memory.** See §12.

Implemented as an **editable config file** with best-effort defaults, so it can
be corrected without code changes.

### 9.3 CSV export

Flat export of all entries for a tax year: date, type, description, category,
amount, claimable, receipt filename, HMRC box. Usable by her or an accountant.

### 9.4 Before-you-file checklist

Plain-language prompts: any months with no income logged? Any uncategorised
entries? Any large purchase without a receipt photo? Has home office been
confirmed for the year?

---

## 10. Help & guidance

### 10.1 알아두기 / Good to know

Collapsible topics, both languages, each with the GOV.UK link it came from and
the date it was checked:

- What being self-employed means — registering, what a UTR is
- What you can claim — the six categories with piano-teaching examples; why
  mileage replaces petrol; what the home-office rate covers; how buying a piano
  works
- Key dates — 5 October to register, 31 January to file and pay, 5 April year
  end
- Words you might see — a short bilingual glossary written as "this word
  means…": turnover, profit, allowance, Self Assessment, cash basis, Class 4

### 10.2 놓치기 쉬운 것 / Easy to miss

The four nudges in §7.6, surfaced **when her figures make them apply**, and
browsable here in full.

### 10.3 Disclaimer

General information, not personal tax advice. Every topic dated and linked to
GOV.UK. Content verified at build time, not written from memory.

---

## 11. Platform and storage

### 11.1 Installable web app

Built as a PWA. She visits the URL once in Chrome or Edge, clicks **Install**,
and gets a desktop icon that opens in its own window with no address bar. From
her side it behaves like an application.

Edge ships with Windows, so there is nothing for her to download first.

### 11.2 Data location

The **File System Access API** gives the app read/write access to a folder she
chooses once. Her data and receipts are real, visible files — not hidden browser
storage that a PC-cleanup tool could wipe.

Given HMRC's record-retention expectations, durability matters more than
convenience here.

### 11.3 Backup

- Automatic weekly copy into `backups/`
- A single **내 기록 백업 / Back up my records** button that copies the whole
  folder to a USB stick or chosen location
- A gentle reminder ahead of the January deadline

### 11.4 What is and is not local

- **Her data never leaves her computer.** No account, no sign-in, no upload, no
  server. Works fully offline.
- **The app's code** is fetched once from a static host at install time, then
  cached and run locally. A one-time download, like an installer.
- The developer's Raspberry Pi is only where the code is written. It plays no
  part in running the app.

### 11.5 Packaging is reversible

App logic is kept strictly separate from platform/packaging concerns. File
access sits behind a single storage interface. If a native installer is ever
needed, the same code drops into a Tauri wrapper — packaging is a delivery
decision, not an architectural one.

This also matters because the development machine is a Raspberry Pi (Linux
ARM64), from which producing a signed Windows executable or notarised macOS app
is impractical.

---

## 12. Requires real-world verification

These must be checked against primary sources during implementation, **not
written from the model's memory**. Each lives in a dated config file.

1. **Tax year rates.** Personal allowance, income tax bands and rates, Class 4
   NI rates and thresholds, small profits threshold, voluntary Class 2 weekly
   rate, trading allowance, Marriage Allowance value.
2. **Mileage rates** and the 10,000-mile threshold.
3. **Home-office flat-rate bands** — the hours-per-month bands and monthly
   amounts.
4. **Category → SA103S box numbers.** The least certain item. Insurance and
   home-office costs fall in different boxes from professional fees, and small
   equipment is genuinely ambiguous. Recommend a one-off check by an accountant
   or against HMRC's SA103S notes before she files.
5. **Filing walkthrough steps** — HMRC's online journey changes; the walkthrough
   must reflect the current screens.
6. **MTD thresholds and dates**, for the reassurance note.

### Note on which tax years are needed

As of 2026-09-17 the current tax year is **2026/27**, but the return she will
file by 31 January 2027 is for **2025/26**. The app therefore needs **both**
years' rates from day one: 2025/26 to produce her filing figures, and 2026/27 to
show a live estimate for the year in progress.

---

## 13. Error tolerance

A guiding principle: no confirmation dialogue that punishes her for being
unsure, and no action she cannot walk back.

- **Everything is editable, always.** No locking, no "finalising", no closing
  the books.
- **Deletion is reversible twice** — inline undo, then Recently deleted.
- **Wrong category is a two-tap fix**, and the app learns from it.
- **A bad import undoes in one action.**
- **Changing a date** moves the entry to the correct tax year automatically. She
  never has to understand that the year runs 6 April to 5 April.
- **Auto-generated entries** are editable and deletable like any other.
- **Old tax years stay open.** If she adds something to a year that may already
  be filed, the app notes that HMRC permits amending a submitted return for up
  to twelve months after the deadline — a mistake found later is a correction,
  not a catastrophe.
- **Amount fields accept anything sensible**: `30`, `£30`, `30.00`, `30.5`.

---

## 14. Accessibility and language

- Korean and English on **every** label, Korean first
- Base text size large by default, with normal / large / very large control
- High contrast by default
- Large tap targets
- No jargon in the interface; accounting terms appear only in the glossary and
  on the filing walkthrough, where they match what HMRC's website shows her
- All screens printable

---

## 15. Technical stack

- **TypeScript + React + Vite** — well-supported, good for parallel
  implementation
- **Data:** single `data.json` via the File System Access API. At roughly a few
  hundred entries per year over five years, JSON is entirely adequate and has
  the significant advantage of being human-readable and recoverable without the
  app.
- **No backend, no database server, no authentication.**
- **Storage behind a single interface** so the PWA/Tauri decision stays
  reversible (§11.5).
- **Pure calculation modules** — tax engine, categoriser, tax-year logic, CSV
  parsing — with no UI or storage dependencies, so they can be tested directly.
