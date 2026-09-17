# Piano Accounts — Plan 1: Core Usable App

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fully usable local record-keeping app for a UK sole-trader piano teacher — she logs income, purchases, journeys and home-office use through four plain-language buttons, sees a live tax estimate, edits or undoes anything, and exports a CSV. Bilingual Korean/English throughout. No cloud, no account, data in real files she controls.

**Architecture:** Pure calculation modules (money, tax year, categoriser, mileage, home office, tax engine, summary, CSV) with no UI or storage dependencies, tested directly with Vitest. A single `StorageAdapter` interface hides the File System Access API so packaging stays reversible. React UI on top, wired through one app store that owns the entries array and persists via the adapter. All money is integer pence.

**Tech Stack:** TypeScript, React 18, Vite, Vitest, File System Access API. No backend, no database server, no auth.

**Spec:** `docs/superpowers/specs/2026-09-17-piano-accounts-design.md`

## Global Constraints

- **Money is integer pence everywhere.** Never store or compute with floating-point pounds. Format to pounds only for display. (Spec §5.2)
- **Tax year is calculated from date, never stored.** 6 April → following 5 April. (Spec §5.3)
- **Every user-facing label is bilingual, Korean first, English second**, e.g. `수입 / Money in`. (Spec §14)
- **Money displays as plain positive numbers** — no red, no minus signs, no parentheses. (Spec §4.1)
- **No tax rate, band, threshold, or mileage/home-office figure is hardcoded in logic or UI text.** All come from the dated config in `src/config/taxYears.ts`. (Spec §12, §4.1)
- **Tax figures in config MUST be verified against GOV.UK at build time, not written from memory.** Each config value carries a source URL and a verification checkbox. (Spec §12)
- **Both tax years 2025/26 and 2026/27 are required from day one** — 2025/26 for the return due 31 Jan 2027, 2026/27 for the live estimate of the year in progress. (Spec §12)
- **Nothing is ever hard-deleted or locked.** Soft delete with undo; all entries always editable. (Spec §13)
- **Target platform is Chrome/Edge on Windows** (File System Access API). (Spec §11)
- **Node 20+** for the toolchain.

---

## File Structure

```
piano-accounts/
  package.json, tsconfig.json, vite.config.ts, index.html
  public/manifest.webmanifest, public/icons/
  src/
    main.tsx, App.tsx
    config/
      taxYears.ts         # dated rates: allowance, bands, NI, mileage, home-office bands, trading allowance, marriage allowance, small-profits & class 2
      categories.ts       # category keys + bilingual labels + EN/KO keyword sets + order
      fuel.ts             # fuel keyword set for non-claimable detection
    domain/
      money.ts            # parsePence, formatPounds
      taxYear.ts          # taxYearOf, taxYearBounds, currentTaxYear, formatTaxYear
      entry.ts            # Entry type + factory helpers
      categoriser.ts      # categorise(description, learnedMerchants)
      mileage.ts          # mileagePence(miles, rates)
      homeOffice.ts       # monthlyBandPence(hoursPerWeek, bands), generateHomeOfficeMonths(taxYear, hoursPerWeek, rates)
      taxEngine.ts        # estimate(profitPence, otherIncomePence, rates)
      summary.ts          # summarise(entries, taxYear)
      csvExport.ts        # toCsv(entries, taxYear)
    storage/
      storage.ts          # StorageAdapter interface + AppData type
      memoryStorage.ts    # in-memory adapter for tests
      fileSystemStorage.ts# File System Access API adapter
      backup.ts           # weekly + manual backup
    state/
      store.ts            # useStore: entries CRUD, soft delete, undo, settings, learned merchants
    i18n/strings.ts       # KO/EN label pairs
    ui/
      components/BilingualLabel.tsx, MoneyDisplay.tsx, BigButton.tsx
      HomeScreen.tsx, SummaryPanel.tsx
      forms/GotPaidForm.tsx, BoughtSomethingForm.tsx, DroveToLessonForm.tsx, WorkedFromHomeForm.tsx
      EntryList.tsx, EditEntry.tsx, RecentlyDeleted.tsx
      Settings.tsx, FirstRun.tsx
  tests/  (mirrors src/ for domain + storage)
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Produces: a buildable Vite+React+TS project with Vitest wired; `npm test` and `npm run build` work.

- [ ] **Step 1: Create the project with Vite**

```bash
cd /home/rhyschung/piano-accounts
npm create vite@latest . -- --template react-ts
npm install
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Add test config to `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
```

Create `tests/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 3: Write the smoke test**

```ts
// tests/smoke.test.ts
import { describe, it, expect } from 'vitest'

describe('toolchain', () => {
  it('runs tests', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 4: Run it**

Run: `npm test`
Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Vite + React + TS + Vitest"
```

---

### Task 2: Money module

**Files:**
- Create: `src/domain/money.ts`
- Test: `tests/domain/money.test.ts`

**Interfaces:**
- Produces:
  - `parsePence(input: string): number | null` — accepts `"30"`, `"£30"`, `"30.00"`, `"30.5"`, `" £1,234.56 "`; returns integer pence, or `null` if not sensible.
  - `formatPounds(pence: number): string` — `"£30.00"`, always positive-formatted, thousands separators.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/money.test.ts
import { describe, it, expect } from 'vitest'
import { parsePence, formatPounds } from '../../src/domain/money'

describe('parsePence', () => {
  it('parses plain integers', () => { expect(parsePence('30')).toBe(3000) })
  it('parses pound sign', () => { expect(parsePence('£30')).toBe(3000) })
  it('parses two decimals', () => { expect(parsePence('30.00')).toBe(3000) })
  it('parses one decimal', () => { expect(parsePence('30.5')).toBe(3050) })
  it('parses commas and whitespace', () => { expect(parsePence(' £1,234.56 ')).toBe(123456) })
  it('rounds to nearest penny', () => { expect(parsePence('30.005')).toBe(3001) })
  it('rejects empty', () => { expect(parsePence('')).toBeNull() })
  it('rejects letters', () => { expect(parsePence('abc')).toBeNull() })
  it('rejects negative', () => { expect(parsePence('-5')).toBeNull() })
})

describe('formatPounds', () => {
  it('formats pence to pounds', () => { expect(formatPounds(3000)).toBe('£30.00') })
  it('formats with thousands separator', () => { expect(formatPounds(123456)).toBe('£1,234.56') })
  it('formats zero', () => { expect(formatPounds(0)).toBe('£0.00') })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- money`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

```ts
// src/domain/money.ts
export function parsePence(input: string): number | null {
  const cleaned = input.replace(/[£,\s]/g, '')
  if (cleaned === '' || !/^\d+(\.\d+)?$/.test(cleaned)) return null
  const pounds = Number(cleaned)
  if (!Number.isFinite(pounds)) return null
  return Math.round(pounds * 100)
}

export function formatPounds(pence: number): string {
  const pounds = Math.abs(pence) / 100
  return '£' + pounds.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- money`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/money.ts tests/domain/money.test.ts
git commit -m "feat: money parsing and formatting in integer pence"
```

---

### Task 3: Tax-year module

**Files:**
- Create: `src/domain/taxYear.ts`
- Test: `tests/domain/taxYear.test.ts`

**Interfaces:**
- Produces:
  - `taxYearOf(isoDate: string): string` — returns e.g. `"2025/26"` for a `YYYY-MM-DD` date.
  - `taxYearBounds(taxYear: string): { start: string; end: string }` — inclusive ISO bounds.
  - `currentTaxYear(today?: Date): string`.
  - `formatTaxYear(taxYear: string): string` — `"6 Apr 2025 – 5 Apr 2026"`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/taxYear.test.ts
import { describe, it, expect } from 'vitest'
import { taxYearOf, taxYearBounds, currentTaxYear, formatTaxYear } from '../../src/domain/taxYear'

describe('taxYearOf', () => {
  it('5 April is the end of the prior year', () => { expect(taxYearOf('2026-04-05')).toBe('2025/26') })
  it('6 April starts a new year', () => { expect(taxYearOf('2026-04-06')).toBe('2026/27') })
  it('mid-year', () => { expect(taxYearOf('2025-09-17')).toBe('2025/26') })
  it('1 January belongs to the year that started the prior April', () => { expect(taxYearOf('2026-01-10')).toBe('2025/26') })
})

describe('taxYearBounds', () => {
  it('gives inclusive April bounds', () => {
    expect(taxYearBounds('2025/26')).toEqual({ start: '2025-04-06', end: '2026-04-05' })
  })
})

describe('currentTaxYear', () => {
  it('uses supplied date', () => { expect(currentTaxYear(new Date('2026-09-17'))).toBe('2026/27') })
})

describe('formatTaxYear', () => {
  it('formats readable bounds', () => { expect(formatTaxYear('2025/26')).toBe('6 Apr 2025 – 5 Apr 2026') })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- taxYear`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/domain/taxYear.ts
export function taxYearOf(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const startYear = (m > 4 || (m === 4 && d >= 6)) ? y : y - 1
  const endShort = String((startYear + 1) % 100).padStart(2, '0')
  return `${startYear}/${endShort}`
}

export function taxYearBounds(taxYear: string): { start: string; end: string } {
  const startYear = Number(taxYear.split('/')[0])
  return { start: `${startYear}-04-06`, end: `${startYear + 1}-04-05` }
}

export function currentTaxYear(today: Date = new Date()): string {
  const iso = today.toISOString().slice(0, 10)
  return taxYearOf(iso)
}

export function formatTaxYear(taxYear: string): string {
  const startYear = Number(taxYear.split('/')[0])
  return `6 Apr ${startYear} – 5 Apr ${startYear + 1}`
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- taxYear`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/taxYear.ts tests/domain/taxYear.test.ts
git commit -m "feat: tax-year calculation from dates (6 Apr boundary)"
```

---

### Task 4: Tax-year rate config (VERIFICATION REQUIRED)

**Files:**
- Create: `src/config/taxYears.ts`
- Test: `tests/config/taxYears.test.ts`

**Interfaces:**
- Produces:
  - `interface TaxYearRates { personalAllowancePence; basicRateLimitPence; basicRatePct; higherRatePct; class4LowerPence; class4UpperPence; class4MainPct; class4UpperPct; mileageHigherPencePerMile; mileageLowerPencePerMile; mileageThresholdMiles; homeOfficeBands: {minHours:number; monthlyPence:number}[]; tradingAllowancePence; marriageAllowanceBenefitPence; smallProfitsThresholdPence; class2WeeklyPence; }`
  - `const TAX_YEARS: Record<string, TaxYearRates>` with keys `"2025/26"` and `"2026/27"`.
  - `getRates(taxYear: string): TaxYearRates` — throws a clear error if the year is missing.

> **VERIFICATION GATE — do not skip.** Every number below must be confirmed against GOV.UK before this task is marked done. Do not trust memory. Sources:
> - Income tax rates & allowance: https://www.gov.uk/income-tax-rates
> - Class 4 NI: https://www.gov.uk/self-employed-national-insurance-rates
> - Mileage (simplified expenses): https://www.gov.uk/simplified-expenses/vehicles
> - Home-office flat rate: https://www.gov.uk/simplified-expenses/working-from-home
> - Trading allowance: https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income
> - Marriage Allowance: https://www.gov.uk/marriage-allowance
> - Small profits threshold & voluntary Class 2: https://www.gov.uk/self-employed-national-insurance-rates
>
> If any 2026/27 figure is not yet published, fall back to the 2025/26 value **and** add a `// UNCONFIRMED 2026/27 — recheck` comment on that line. The frozen personal allowance (£12,570) and higher-rate threshold (£50,270) are expected to hold through 2027/28, but confirm.

- [ ] **Step 1: Write the failing tests** (structure and internal consistency, not the disputed magnitudes)

```ts
// tests/config/taxYears.test.ts
import { describe, it, expect } from 'vitest'
import { getRates, TAX_YEARS } from '../../src/config/taxYears'

describe('tax year config', () => {
  it('has both required years', () => {
    expect(Object.keys(TAX_YEARS)).toEqual(expect.arrayContaining(['2025/26', '2026/27']))
  })
  it('throws clearly for a missing year', () => {
    expect(() => getRates('2099/00')).toThrow(/no tax rates/i)
  })
  it('home-office bands are ascending by hours', () => {
    for (const y of Object.values(TAX_YEARS)) {
      const hours = y.homeOfficeBands.map(b => b.minHours)
      expect([...hours].sort((a, b) => a - b)).toEqual(hours)
    }
  })
  it('class 4 lower threshold is below upper', () => {
    for (const y of Object.values(TAX_YEARS)) {
      expect(y.class4LowerPence).toBeLessThan(y.class4UpperPence)
    }
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- taxYears`
Expected: FAIL.

- [ ] **Step 3: Implement, filling verified figures**

```ts
// src/config/taxYears.ts
export interface HomeOfficeBand { minHours: number; monthlyPence: number }

export interface TaxYearRates {
  personalAllowancePence: number
  basicRateLimitPence: number      // upper edge of basic rate band (taxable income)
  basicRatePct: number
  higherRatePct: number
  class4LowerPence: number
  class4UpperPence: number
  class4MainPct: number
  class4UpperPct: number
  mileageHigherPencePerMile: number
  mileageLowerPencePerMile: number
  mileageThresholdMiles: number
  homeOfficeBands: HomeOfficeBand[]
  tradingAllowancePence: number
  marriageAllowanceBenefitPence: number
  smallProfitsThresholdPence: number
  class2WeeklyPence: number
}

// VALUES BELOW REQUIRE GOV.UK VERIFICATION — see the verification gate in the plan.
const RATES_2025_26: TaxYearRates = {
  personalAllowancePence: 1_257_000,      // £12,570
  basicRateLimitPence: 5_027_000,         // £50,270 threshold
  basicRatePct: 20,
  higherRatePct: 40,
  class4LowerPence: 1_257_000,            // £12,570
  class4UpperPence: 5_027_000,            // £50,270
  class4MainPct: 6,
  class4UpperPct: 2,
  mileageHigherPencePerMile: 45,
  mileageLowerPencePerMile: 25,
  mileageThresholdMiles: 10_000,
  homeOfficeBands: [
    { minHours: 25, monthlyPence: 1000 },   // 25–50 hrs: £10
    { minHours: 51, monthlyPence: 1800 },   // 51–100 hrs: £18
    { minHours: 101, monthlyPence: 2600 },  // 101+ hrs: £26
  ],
  tradingAllowancePence: 100_000,          // £1,000
  marriageAllowanceBenefitPence: 25_200,   // ~£252
  smallProfitsThresholdPence: 672_500,     // £6,725
  class2WeeklyPence: 350,                  // £3.50/week voluntary
}

// Start 2026/27 as a copy; recheck each line against GOV.UK.
const RATES_2026_27: TaxYearRates = { ...RATES_2025_26 } // UNCONFIRMED 2026/27 — recheck all

export const TAX_YEARS: Record<string, TaxYearRates> = {
  '2025/26': RATES_2025_26,
  '2026/27': RATES_2026_27,
}

export function getRates(taxYear: string): TaxYearRates {
  const r = TAX_YEARS[taxYear]
  if (!r) throw new Error(`No tax rates configured for ${taxYear}`)
  return r
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- taxYears`
Expected: PASS.

- [ ] **Step 5: Verify every figure against GOV.UK**

Open each source URL above. Tick only when the code matches the live page. Correct any mismatch and re-run tests. Leave `UNCONFIRMED` comments only where a 2026/27 figure genuinely is not yet published.

- [ ] **Step 6: Commit**

```bash
git add src/config/taxYears.ts tests/config/taxYears.test.ts
git commit -m "feat: dated tax-year rate config for 2025/26 and 2026/27 (GOV.UK-verified)"
```

---

### Task 5: Entry model

**Files:**
- Create: `src/domain/entry.ts`
- Test: `tests/domain/entry.test.ts`

**Interfaces:**
- Produces:
  - `type EntryType = 'income' | 'expense' | 'journey' | 'home_office'`
  - `interface Entry { id; date; type; amountPence; description; category; source: 'manual'|'import'|'auto'; importBatchId?: string|null; receiptFile?: string|null; claimable: boolean; deletedAt?: string|null; createdAt: string; details?: Record<string, unknown> }`
  - `newId(): string`
  - `makeEntry(partial): Entry` — fills `id`, `createdAt`, defaults `claimable:true`, `deletedAt:null`, `source:'manual'`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/entry.test.ts
import { describe, it, expect } from 'vitest'
import { makeEntry, newId } from '../../src/domain/entry'

describe('makeEntry', () => {
  it('fills defaults', () => {
    const e = makeEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
    expect(e.id).toBeTruthy()
    expect(e.createdAt).toBeTruthy()
    expect(e.claimable).toBe(true)
    expect(e.deletedAt).toBeNull()
    expect(e.source).toBe('manual')
  })
  it('respects explicit claimable false', () => {
    const e = makeEntry({ date: '2025-09-01', type: 'expense', amountPence: 5000, description: 'Shell', category: 'travel', claimable: false })
    expect(e.claimable).toBe(false)
  })
})

describe('newId', () => {
  it('is unique', () => { expect(newId()).not.toBe(newId()) })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- entry`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/domain/entry.ts
export type EntryType = 'income' | 'expense' | 'journey' | 'home_office'

export interface Entry {
  id: string
  date: string
  type: EntryType
  amountPence: number
  description: string
  category: string
  source: 'manual' | 'import' | 'auto'
  importBatchId?: string | null
  receiptFile?: string | null
  claimable: boolean
  deletedAt?: string | null
  createdAt: string
  details?: Record<string, unknown>
}

export function newId(): string {
  return (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
}

export function makeEntry(
  partial: Omit<Entry, 'id' | 'createdAt' | 'claimable' | 'deletedAt' | 'source'> &
    Partial<Pick<Entry, 'claimable' | 'deletedAt' | 'source' | 'importBatchId' | 'receiptFile' | 'details'>>,
): Entry {
  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    claimable: partial.claimable ?? true,
    deletedAt: partial.deletedAt ?? null,
    source: partial.source ?? 'manual',
    ...partial,
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- entry`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/entry.ts tests/domain/entry.test.ts
git commit -m "feat: Entry model and factory"
```

---

### Task 6: Category config + categoriser (incl. fuel non-claimable)

**Files:**
- Create: `src/config/categories.ts`, `src/config/fuel.ts`, `src/domain/categoriser.ts`
- Test: `tests/domain/categoriser.test.ts`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces:
  - `interface Category { key; labelKo; labelEn; keywordsEn: string[]; keywordsKo: string[] }`
  - `const CATEGORIES: Category[]` in match order, ending with `uncategorised`.
  - `const FUEL_KEYWORDS: string[]`.
  - `interface CategoriseResult { category: string; claimable: boolean; note?: 'fuel_excluded' }`
  - `categorise(description: string, learnedMerchants: Record<string,string>): CategoriseResult` — learned merchant match wins first; then fuel detection (→ `travel`, `claimable:false`, `note:'fuel_excluded'`); then keyword match (EN then KO), first match wins; else `uncategorised`, claimable true.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/categoriser.test.ts
import { describe, it, expect } from 'vitest'
import { categorise } from '../../src/domain/categoriser'

describe('categorise', () => {
  it('matches an English keyword, case-insensitive', () => {
    expect(categorise('Train to London', {})).toMatchObject({ category: 'travel', claimable: true })
  })
  it('matches a Korean keyword', () => {
    expect(categorise('악보 구입', {}).category).toBe('equipment') // 악보 = sheet music
  })
  it('detects fuel and marks it not claimable', () => {
    expect(categorise('SHELL FOREST RD', {})).toEqual({ category: 'travel', claimable: false, note: 'fuel_excluded' })
  })
  it('keeps parking claimable', () => {
    expect(categorise('NCP parking', {})).toMatchObject({ category: 'travel', claimable: true })
  })
  it('falls back to uncategorised', () => {
    expect(categorise('Mystery shop', {})).toMatchObject({ category: 'uncategorised', claimable: true })
  })
  it('first match wins in category order', () => {
    // "insurance" (professional) before generic words
    expect(categorise('Music teacher insurance', {}).category).toBe('professional')
  })
  it('learned merchant overrides keywords', () => {
    expect(categorise('HOBGOBLIN MUSIC', { 'hobgoblin music': 'equipment' }).category).toBe('equipment')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- categoriser`
Expected: FAIL.

- [ ] **Step 3: Implement config and categoriser**

```ts
// src/config/fuel.ts
export const FUEL_KEYWORDS = ['petrol', 'fuel', 'diesel', 'shell', 'bp', 'esso', 'texaco']
```

```ts
// src/config/categories.ts
export interface Category {
  key: string
  labelKo: string
  labelEn: string
  keywordsEn: string[]
  keywordsKo: string[]
}

// Order matters: first match wins. uncategorised is the fallback and has no keywords.
export const CATEGORIES: Category[] = [
  { key: 'professional', labelKo: '회비·보험', labelEn: 'Professional fees & insurance',
    keywordsEn: ['dbs', 'insurance', 'ism', 'epta', 'membership', 'subscription'],
    keywordsKo: ['보험', '회비', '멤버십', '구독'] },
  { key: 'travel', labelKo: '교통비', labelEn: 'Travel',
    keywordsEn: ['train', 'bus', 'parking', 'mileage'],
    keywordsKo: ['기차', '버스', '주차', '교통'] },
  { key: 'equipment', labelKo: '악기·교재', labelEn: 'Equipment & materials',
    keywordsEn: ['sheet music', 'metronome', 'piano tuning', 'tuner', 'strings', 'music book'],
    keywordsKo: ['악보', '메트로놈', '조율', '교재', '피아노'] },
  { key: 'marketing', labelKo: '홍보', labelEn: 'Marketing',
    keywordsEn: ['advert', 'flyer', 'website', 'business card', 'printing'],
    keywordsKo: ['광고', '전단', '웹사이트', '명함', '인쇄'] },
  { key: 'home_office', labelKo: '재택근무', labelEn: 'Working from home',
    keywordsEn: ['electricity', 'gas', 'broadband', 'internet', 'heating', 'rent'],
    keywordsKo: ['전기', '가스', '인터넷', '난방', '임대'] },
  { key: 'training', labelKo: '교육·연수', labelEn: 'Training & CPD',
    keywordsEn: ['course', 'workshop', 'exam fee', 'conference', 'masterclass'],
    keywordsKo: ['강좌', '워크숍', '시험', '학회', '마스터클래스'] },
  { key: 'uncategorised', labelKo: '확인 필요', labelEn: 'Needs checking', keywordsEn: [], keywordsKo: [] },
]
```

```ts
// src/domain/categoriser.ts
import { CATEGORIES } from '../config/categories'
import { FUEL_KEYWORDS } from '../config/fuel'

export interface CategoriseResult {
  category: string
  claimable: boolean
  note?: 'fuel_excluded'
}

export function categorise(
  description: string,
  learnedMerchants: Record<string, string>,
): CategoriseResult {
  const text = description.toLowerCase()

  for (const merchant of Object.keys(learnedMerchants)) {
    if (text.includes(merchant.toLowerCase())) {
      return { category: learnedMerchants[merchant], claimable: true }
    }
  }

  if (FUEL_KEYWORDS.some(k => text.includes(k))) {
    return { category: 'travel', claimable: false, note: 'fuel_excluded' }
  }

  for (const cat of CATEGORIES) {
    const hit = [...cat.keywordsEn, ...cat.keywordsKo].some(k => text.includes(k.toLowerCase()))
    if (hit) return { category: cat.key, claimable: true }
  }

  return { category: 'uncategorised', claimable: true }
}
```

Note: `parking` matches `travel` before fuel would ever apply because fuel is checked first only for fuel words; `parking` contains none of the fuel keywords, so it stays claimable. Verify the "first match wins" test passes given the category order (professional before others).

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- categoriser`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config/categories.ts src/config/fuel.ts src/domain/categoriser.ts tests/domain/categoriser.test.ts
git commit -m "feat: bilingual categoriser with fuel/mileage exclusion and learned merchants"
```

---

### Task 7: Mileage module

**Files:**
- Create: `src/domain/mileage.ts`
- Test: `tests/domain/mileage.test.ts`

**Interfaces:**
- Consumes: `TaxYearRates` from `src/config/taxYears.ts`.
- Produces: `mileagePence(miles: number, rates: TaxYearRates, milesAlreadyThisYear?: number): number`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/mileage.test.ts
import { describe, it, expect } from 'vitest'
import { mileagePence } from '../../src/domain/mileage'
import { getRates } from '../../src/config/taxYears'

const r = getRates('2025/26')

describe('mileagePence', () => {
  it('applies the higher rate under the threshold', () => {
    expect(mileagePence(10, r)).toBe(10 * r.mileageHigherPencePerMile)
  })
  it('rounds to whole pence', () => {
    expect(Number.isInteger(mileagePence(3.3, r))).toBe(true)
  })
  it('applies the lower rate above the threshold', () => {
    expect(mileagePence(1, r, r.mileageThresholdMiles)).toBe(r.mileageLowerPencePerMile)
  })
  it('splits a journey that crosses the threshold', () => {
    const miles = 100
    const already = r.mileageThresholdMiles - 40 // 40 at higher, 60 at lower
    expect(mileagePence(miles, r, already))
      .toBe(40 * r.mileageHigherPencePerMile + 60 * r.mileageLowerPencePerMile)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- mileage`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/domain/mileage.ts
import type { TaxYearRates } from '../config/taxYears'

export function mileagePence(miles: number, rates: TaxYearRates, milesAlreadyThisYear = 0): number {
  const remainingHigher = Math.max(0, rates.mileageThresholdMiles - milesAlreadyThisYear)
  const higherMiles = Math.min(miles, remainingHigher)
  const lowerMiles = miles - higherMiles
  return Math.round(
    higherMiles * rates.mileageHigherPencePerMile +
    lowerMiles * rates.mileageLowerPencePerMile,
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- mileage`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/mileage.ts tests/domain/mileage.test.ts
git commit -m "feat: flat-rate mileage with 10,000-mile threshold split"
```

---

### Task 8: Home-office module

**Files:**
- Create: `src/domain/homeOffice.ts`
- Test: `tests/domain/homeOffice.test.ts`

**Interfaces:**
- Consumes: `TaxYearRates`, `taxYearBounds`, `makeEntry`, `Entry`.
- Produces:
  - `monthlyBandPence(hoursPerWeek: number, rates: TaxYearRates): number` — 0 if below the lowest band.
  - `generateHomeOfficeMonths(taxYear: string, hoursPerWeek: number, rates: TaxYearRates): Entry[]` — one `home_office` entry per month in the tax year, `source:'auto'`, dated the 1st (clamped to the year bounds for the part-months of April), with `details:{ month, hoursPerWeek, bandPence }`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/homeOffice.test.ts
import { describe, it, expect } from 'vitest'
import { monthlyBandPence, generateHomeOfficeMonths } from '../../src/domain/homeOffice'
import { getRates } from '../../src/config/taxYears'

const r = getRates('2025/26')

describe('monthlyBandPence', () => {
  it('is zero below the lowest band', () => { expect(monthlyBandPence(10, r)).toBe(0) })
  it('picks the 25-hour band', () => { expect(monthlyBandPence(30, r)).toBe(r.homeOfficeBands[0].monthlyPence) })
  it('picks the highest band when hours are high', () => {
    expect(monthlyBandPence(120, r)).toBe(r.homeOfficeBands[r.homeOfficeBands.length - 1].monthlyPence)
  })
})

describe('generateHomeOfficeMonths', () => {
  it('creates twelve monthly entries', () => {
    const entries = generateHomeOfficeMonths('2025/26', 30, r)
    expect(entries).toHaveLength(12)
    expect(entries.every(e => e.type === 'home_office' && e.source === 'auto')).toBe(true)
    expect(entries.every(e => e.category === 'home_office')).toBe(true)
  })
  it('creates none when hours are below the lowest band', () => {
    expect(generateHomeOfficeMonths('2025/26', 5, r)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- homeOffice`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/domain/homeOffice.ts
import type { TaxYearRates } from '../config/taxYears'
import { makeEntry, type Entry } from './entry'

export function monthlyBandPence(hoursPerWeek: number, rates: TaxYearRates): number {
  let pence = 0
  for (const band of rates.homeOfficeBands) {
    if (hoursPerWeek >= band.minHours) pence = band.monthlyPence
  }
  return pence
}

export function generateHomeOfficeMonths(
  taxYear: string,
  hoursPerWeek: number,
  rates: TaxYearRates,
): Entry[] {
  const bandPence = monthlyBandPence(hoursPerWeek, rates)
  if (bandPence === 0) return []
  const startYear = Number(taxYear.split('/')[0])
  const entries: Entry[] = []
  for (let i = 0; i < 12; i++) {
    const monthIndex = (3 + i) % 12          // April = index 3
    const year = monthIndex >= 3 ? startYear : startYear + 1
    const mm = String(monthIndex + 1).padStart(2, '0')
    const monthKey = `${year}-${mm}`
    entries.push(makeEntry({
      date: `${monthKey}-01`,
      type: 'home_office',
      amountPence: bandPence,
      description: 'Working from home / 재택근무',
      category: 'home_office',
      source: 'auto',
      details: { month: monthKey, hoursPerWeek, bandPence },
    }))
  }
  return entries
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- homeOffice`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/homeOffice.ts tests/domain/homeOffice.test.ts
git commit -m "feat: home-office flat-rate bands and monthly auto-entries"
```

---

### Task 9: Tax engine

**Files:**
- Create: `src/domain/taxEngine.ts`
- Test: `tests/domain/taxEngine.test.ts`

**Interfaces:**
- Consumes: `TaxYearRates`.
- Produces:
  - `interface TaxEstimate { profitPence; incomeTaxPence; class4Pence; totalPence; isLoss: boolean }`
  - `estimate(profitPence: number, otherIncomePence: number, rates: TaxYearRates): TaxEstimate` — other income stacks beneath profit to consume the allowance first; income tax on profit's share above the allowance; Class 4 NI on profit between the class-4 thresholds. Loss (profit < 0) yields zero tax and `isLoss:true`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/taxEngine.test.ts
import { describe, it, expect } from 'vitest'
import { estimate } from '../../src/domain/taxEngine'
import { getRates } from '../../src/config/taxYears'

const r = getRates('2025/26')

describe('estimate', () => {
  it('is zero below the allowance with no other income', () => {
    const e = estimate(1_000_000, 0, r) // £10,000 profit
    expect(e.totalPence).toBe(0)
  })
  it('taxes profit above the allowance at basic rate + class 4', () => {
    const profit = 2_000_000 // £20,000
    const taxable = profit - r.personalAllowancePence // £7,430
    const incomeTax = Math.round(taxable * r.basicRatePct / 100)
    const class4 = Math.round((profit - r.class4LowerPence) * r.class4MainPct / 100)
    const e = estimate(profit, 0, r)
    expect(e.incomeTaxPence).toBe(incomeTax)
    expect(e.class4Pence).toBe(class4)
    expect(e.totalPence).toBe(incomeTax + class4)
  })
  it('other income consumes the allowance first', () => {
    // £13,000 other income already exceeds the allowance, so all profit is taxed
    const profit = 1_000_000
    const e = estimate(profit, 1_300_000, r)
    expect(e.incomeTaxPence).toBe(Math.round(profit * r.basicRatePct / 100))
  })
  it('reports a loss without tax', () => {
    const e = estimate(-500_000, 0, r)
    expect(e.isLoss).toBe(true)
    expect(e.totalPence).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- taxEngine`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/domain/taxEngine.ts
import type { TaxYearRates } from '../config/taxYears'

export interface TaxEstimate {
  profitPence: number
  incomeTaxPence: number
  class4Pence: number
  totalPence: number
  isLoss: boolean
}

export function estimate(profitPence: number, otherIncomePence: number, rates: TaxYearRates): TaxEstimate {
  if (profitPence < 0) {
    return { profitPence, incomeTaxPence: 0, class4Pence: 0, totalPence: 0, isLoss: true }
  }

  // Allowance is consumed by other income first, then by profit.
  const allowanceLeftForProfit = Math.max(0, rates.personalAllowancePence - otherIncomePence)
  const taxableProfit = Math.max(0, profitPence - allowanceLeftForProfit)

  // Basic/higher bands measured on total taxable income above the allowance.
  const bandWidth = rates.basicRateLimitPence - rates.personalAllowancePence
  const otherTaxableAbove = Math.max(0, otherIncomePence - rates.personalAllowancePence)
  const basicRoom = Math.max(0, bandWidth - otherTaxableAbove)
  const basicPart = Math.min(taxableProfit, basicRoom)
  const higherPart = taxableProfit - basicPart
  const incomeTaxPence = Math.round(
    basicPart * rates.basicRatePct / 100 + higherPart * rates.higherRatePct / 100,
  )

  // Class 4 NI on profit only, between the class-4 thresholds.
  const class4Main = Math.max(0, Math.min(profitPence, rates.class4UpperPence) - rates.class4LowerPence)
  const class4Upper = Math.max(0, profitPence - rates.class4UpperPence)
  const class4Pence = Math.round(
    class4Main * rates.class4MainPct / 100 + class4Upper * rates.class4UpperPct / 100,
  )

  return {
    profitPence,
    incomeTaxPence,
    class4Pence,
    totalPence: incomeTaxPence + class4Pence,
    isLoss: false,
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- taxEngine`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/taxEngine.ts tests/domain/taxEngine.test.ts
git commit -m "feat: tax estimate with allowance stacking, bands, and Class 4 NI"
```

---

### Task 10: Summary module

**Files:**
- Create: `src/domain/summary.ts`
- Test: `tests/domain/summary.test.ts`

**Interfaces:**
- Consumes: `Entry`, `taxYearOf`, `estimate`, `getRates`, settings' `otherIncomePence`.
- Produces:
  - `interface Summary { incomePence; expensesPence; profitPence; estimate: TaxEstimate }`
  - `summarise(entries: Entry[], taxYear: string, otherIncomePence: number): Summary` — excludes soft-deleted and non-claimable entries from totals; income = income-type; expenses = expense+journey+home_office claimable amounts; profit = income − expenses.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/summary.test.ts
import { describe, it, expect } from 'vitest'
import { summarise } from '../../src/domain/summary'
import { makeEntry } from '../../src/domain/entry'

const entries = [
  makeEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' }),
  makeEntry({ date: '2025-09-02', type: 'expense', amountPence: 2000, description: 'Sheet music', category: 'equipment' }),
  makeEntry({ date: '2025-09-03', type: 'expense', amountPence: 5000, description: 'Shell', category: 'travel', claimable: false }),
  makeEntry({ date: '2025-09-04', type: 'journey', amountPence: 270, description: 'Mrs Patel', category: 'travel' }),
  makeEntry({ date: '2024-09-01', type: 'income', amountPence: 9999, description: 'last year', category: 'income' }),
]

describe('summarise', () => {
  it('totals only claimable, non-deleted entries in the tax year', () => {
    const s = summarise(entries, '2025/26', 0)
    expect(s.incomePence).toBe(3000)
    expect(s.expensesPence).toBe(2270) // 2000 + 270; fuel 5000 excluded
    expect(s.profitPence).toBe(730)
  })
  it('ignores soft-deleted entries', () => {
    const withDeleted = [...entries, makeEntry({ date: '2025-09-05', type: 'income', amountPence: 5000, description: 'x', category: 'income', deletedAt: '2025-09-06T00:00:00Z' })]
    expect(summarise(withDeleted, '2025/26', 0).incomePence).toBe(3000)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- summary`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/domain/summary.ts
import type { Entry } from './entry'
import { taxYearOf } from './taxYear'
import { estimate, type TaxEstimate } from './taxEngine'
import { getRates } from '../config/taxYears'

export interface Summary {
  incomePence: number
  expensesPence: number
  profitPence: number
  estimate: TaxEstimate
}

export function summarise(entries: Entry[], taxYear: string, otherIncomePence: number): Summary {
  const live = entries.filter(e => !e.deletedAt && e.claimable && taxYearOf(e.date) === taxYear)
  let incomePence = 0
  let expensesPence = 0
  for (const e of live) {
    if (e.type === 'income') incomePence += e.amountPence
    else expensesPence += e.amountPence
  }
  const profitPence = incomePence - expensesPence
  return {
    incomePence,
    expensesPence,
    profitPence,
    estimate: estimate(profitPence, otherIncomePence, getRates(taxYear)),
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- summary`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/summary.ts tests/domain/summary.test.ts
git commit -m "feat: tax-year summary totals and estimate"
```

---

### Task 11: CSV export

**Files:**
- Create: `src/domain/csvExport.ts`
- Test: `tests/domain/csvExport.test.ts`

**Interfaces:**
- Consumes: `Entry`, `taxYearOf`, `formatPounds`.
- Produces: `toCsv(entries: Entry[], taxYear: string): string` — header row `Date,Type,Description,Category,Amount,Claimable,Receipt`; one row per non-deleted entry in the year; amounts as plain pounds `12.34` (no £); fields with commas/quotes quoted per RFC 4180.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/csvExport.test.ts
import { describe, it, expect } from 'vitest'
import { toCsv } from '../../src/domain/csvExport'
import { makeEntry } from '../../src/domain/entry'

describe('toCsv', () => {
  it('emits a header and one row per entry in the year', () => {
    const rows = toCsv([
      makeEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' }),
    ], '2025/26').trim().split('\n')
    expect(rows[0]).toBe('Date,Type,Description,Category,Amount,Claimable,Receipt')
    expect(rows[1]).toContain('2025-09-01,income,Emma,income,30.00,yes,')
  })
  it('quotes fields containing commas', () => {
    const csv = toCsv([
      makeEntry({ date: '2025-09-01', type: 'expense', amountPence: 1000, description: 'Books, music', category: 'equipment' }),
    ], '2025/26')
    expect(csv).toContain('"Books, music"')
  })
  it('excludes other tax years and deleted rows', () => {
    const csv = toCsv([
      makeEntry({ date: '2024-01-01', type: 'income', amountPence: 100, description: 'old', category: 'income' }),
    ], '2025/26')
    expect(csv.trim().split('\n')).toHaveLength(1) // header only
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- csvExport`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/domain/csvExport.ts
import type { Entry } from './entry'
import { taxYearOf } from './taxYear'

function esc(field: string): string {
  return /[",\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field
}

export function toCsv(entries: Entry[], taxYear: string): string {
  const header = 'Date,Type,Description,Category,Amount,Claimable,Receipt'
  const rows = entries
    .filter(e => !e.deletedAt && taxYearOf(e.date) === taxYear)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => [
      e.date,
      e.type,
      esc(e.description),
      e.category,
      (e.amountPence / 100).toFixed(2),
      e.claimable ? 'yes' : 'no',
      e.receiptFile ?? '',
    ].join(','))
  return [header, ...rows].join('\n') + '\n'
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- csvExport`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/csvExport.ts tests/domain/csvExport.test.ts
git commit -m "feat: CSV export for a tax year"
```

---

### Task 12: Storage interface + in-memory adapter

**Files:**
- Create: `src/storage/storage.ts`, `src/storage/memoryStorage.ts`
- Test: `tests/storage/memoryStorage.test.ts`

**Interfaces:**
- Consumes: `Entry`.
- Produces:
  - `interface AppData { entries: Entry[]; settings: Settings; learnedMerchants: Record<string,string> }`
  - `interface Settings { hoursPerWeekAtHome: number; otherIncomePence: number; textSize: 'normal'|'large'|'xlarge'; largePurchaseThresholdPence: number; folderChosen: boolean }`
  - `const DEFAULT_SETTINGS: Settings` (threshold £500, hours 0, otherIncome 0, textSize 'large', folderChosen false).
  - `interface StorageAdapter { load(): Promise<AppData>; save(data: AppData): Promise<void>; saveReceipt(file: File): Promise<string>; readReceiptUrl(name: string): Promise<string|null> }`
  - `createMemoryStorage(seed?: Partial<AppData>): StorageAdapter`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/storage/memoryStorage.test.ts
import { describe, it, expect } from 'vitest'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { DEFAULT_SETTINGS } from '../../src/storage/storage'

describe('memory storage', () => {
  it('round-trips app data', async () => {
    const s = createMemoryStorage()
    const data = await s.load()
    expect(data.entries).toEqual([])
    expect(data.settings).toEqual(DEFAULT_SETTINGS)
    data.settings.hoursPerWeekAtHome = 30
    await s.save(data)
    expect((await s.load()).settings.hoursPerWeekAtHome).toBe(30)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- memoryStorage`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/storage/storage.ts
import type { Entry } from '../domain/entry'

export interface Settings {
  hoursPerWeekAtHome: number
  otherIncomePence: number
  textSize: 'normal' | 'large' | 'xlarge'
  largePurchaseThresholdPence: number
  folderChosen: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  hoursPerWeekAtHome: 0,
  otherIncomePence: 0,
  textSize: 'large',
  largePurchaseThresholdPence: 50_000,
  folderChosen: false,
}

export interface AppData {
  entries: Entry[]
  settings: Settings
  learnedMerchants: Record<string, string>
}

export function emptyAppData(): AppData {
  return { entries: [], settings: { ...DEFAULT_SETTINGS }, learnedMerchants: {} }
}

export interface StorageAdapter {
  load(): Promise<AppData>
  save(data: AppData): Promise<void>
  saveReceipt(file: File): Promise<string>
  readReceiptUrl(name: string): Promise<string | null>
}
```

```ts
// src/storage/memoryStorage.ts
import { emptyAppData, type AppData, type StorageAdapter } from './storage'

export function createMemoryStorage(seed?: Partial<AppData>): StorageAdapter {
  let data: AppData = { ...emptyAppData(), ...seed }
  const receipts: Record<string, string> = {}
  return {
    async load() { return structuredClone(data) },
    async save(next) { data = structuredClone(next) },
    async saveReceipt(file) {
      const name = `${Date.now()}-${file.name}`
      receipts[name] = 'blob:memory/' + name
      return name
    },
    async readReceiptUrl(name) { return receipts[name] ?? null },
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- memoryStorage`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/storage/storage.ts src/storage/memoryStorage.ts tests/storage/memoryStorage.test.ts
git commit -m "feat: storage interface and in-memory adapter"
```

---

### Task 13: File System Access adapter + backup

**Files:**
- Create: `src/storage/fileSystemStorage.ts`, `src/storage/backup.ts`
- Test: `tests/storage/backup.test.ts`

**Interfaces:**
- Consumes: `StorageAdapter`, `AppData`, `emptyAppData`.
- Produces:
  - `createFileSystemStorage(dirHandle: FileSystemDirectoryHandle): StorageAdapter` — reads/writes `data.json`; receipts into `receipts/`; returns saved filename.
  - `pickFolder(): Promise<FileSystemDirectoryHandle>` — wraps `window.showDirectoryPicker()`.
  - `maybeWeeklyBackup(dirHandle, data, now?): Promise<boolean>` — writes `backups/data-YYYY-MM-DD.json` if the newest backup is 7+ days old; returns whether it backed up. (Pure date logic is unit-tested; the file I/O is exercised manually.)
  - `shouldBackup(lastBackupIso: string | null, now: Date): boolean`.

- [ ] **Step 1: Write the failing test for the pure part**

```ts
// tests/storage/backup.test.ts
import { describe, it, expect } from 'vitest'
import { shouldBackup } from '../../src/storage/backup'

describe('shouldBackup', () => {
  it('backs up when there is no prior backup', () => {
    expect(shouldBackup(null, new Date('2026-09-17'))).toBe(true)
  })
  it('backs up after 7 days', () => {
    expect(shouldBackup('2026-09-09T00:00:00Z', new Date('2026-09-17T00:00:00Z'))).toBe(true)
  })
  it('does not back up within 7 days', () => {
    expect(shouldBackup('2026-09-15T00:00:00Z', new Date('2026-09-17T00:00:00Z'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- backup`
Expected: FAIL.

- [ ] **Step 3: Implement adapter and backup**

```ts
// src/storage/backup.ts
export function shouldBackup(lastBackupIso: string | null, now: Date): boolean {
  if (!lastBackupIso) return true
  const days = (now.getTime() - new Date(lastBackupIso).getTime()) / 86_400_000
  return days >= 7
}

export async function writeBackup(
  dirHandle: FileSystemDirectoryHandle,
  json: string,
  now: Date = new Date(),
): Promise<void> {
  const backups = await dirHandle.getDirectoryHandle('backups', { create: true })
  const name = `data-${now.toISOString().slice(0, 10)}.json`
  const fh = await backups.getFileHandle(name, { create: true })
  const w = await fh.createWritable()
  await w.write(json)
  await w.close()
}
```

```ts
// src/storage/fileSystemStorage.ts
import { emptyAppData, type AppData, type StorageAdapter } from './storage'

export async function pickFolder(): Promise<FileSystemDirectoryHandle> {
  // @ts-expect-error showDirectoryPicker is not yet in all TS lib versions
  return await window.showDirectoryPicker({ mode: 'readwrite' })
}

export function createFileSystemStorage(dirHandle: FileSystemDirectoryHandle): StorageAdapter {
  async function writeFile(name: string, contents: string | Blob) {
    const fh = await dirHandle.getFileHandle(name, { create: true })
    const w = await fh.createWritable()
    await w.write(contents)
    await w.close()
  }
  return {
    async load(): Promise<AppData> {
      try {
        const fh = await dirHandle.getFileHandle('data.json')
        const text = await (await fh.getFile()).text()
        return { ...emptyAppData(), ...JSON.parse(text) }
      } catch {
        return emptyAppData()
      }
    },
    async save(data) {
      await writeFile('data.json', JSON.stringify(data, null, 2))
    },
    async saveReceipt(file) {
      const receipts = await dirHandle.getDirectoryHandle('receipts', { create: true })
      const name = `${Date.now()}-${file.name}`
      const fh = await receipts.getFileHandle(name, { create: true })
      const w = await fh.createWritable()
      await w.write(file)
      await w.close()
      return name
    },
    async readReceiptUrl(name) {
      try {
        const receipts = await dirHandle.getDirectoryHandle('receipts')
        const fh = await receipts.getFileHandle(name)
        return URL.createObjectURL(await fh.getFile())
      } catch {
        return null
      }
    },
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- backup`
Expected: PASS.

- [ ] **Step 5: Manual check note**

Add a comment at the top of `fileSystemStorage.ts`: `// Exercised manually in Chrome/Edge — File System Access API is unavailable under jsdom.` The full read/write path is verified during the Task 21 integration run.

- [ ] **Step 6: Commit**

```bash
git add src/storage/fileSystemStorage.ts src/storage/backup.ts tests/storage/backup.test.ts
git commit -m "feat: File System Access adapter and weekly backup"
```

---

### Task 14: App store (state, CRUD, undo, learning)

**Files:**
- Create: `src/state/store.ts`
- Test: `tests/state/store.test.ts`

**Interfaces:**
- Consumes: `StorageAdapter`, `AppData`, `Entry`, `makeEntry`, `categorise`, `generateHomeOfficeMonths`, `getRates`.
- Produces a framework-agnostic store object (plain functions over state + a subscribe) so it is testable without React:
  - `createStore(adapter: StorageAdapter)` returning `{ getState, subscribe, init, addEntry, updateEntry, softDelete, restore, purgeExpired, learnMerchant, setSettings, regenerateHomeOffice }`.
  - `addEntry(partial)` runs the categoriser for expenses when no category is supplied.
  - `softDelete(id)` sets `deletedAt`; `restore(id)` clears it; both persist.
  - `learnMerchant(merchant, category)` stores lowercased merchant→category and persists.
  - `regenerateHomeOffice(taxYear)` removes existing `source:'auto'` home-office entries for that year and regenerates from `settings.hoursPerWeekAtHome`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/state/store.test.ts
import { describe, it, expect } from 'vitest'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'

async function freshStore() {
  const store = createStore(createMemoryStorage())
  await store.init()
  return store
}

describe('store', () => {
  it('adds an income entry', async () => {
    const s = await freshStore()
    await s.addEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
    expect(s.getState().entries).toHaveLength(1)
  })
  it('auto-categorises an expense with no category', async () => {
    const s = await freshStore()
    await s.addEntry({ date: '2025-09-02', type: 'expense', amountPence: 2000, description: 'Sheet music' })
    expect(s.getState().entries[0].category).toBe('equipment')
  })
  it('marks detected fuel not claimable', async () => {
    const s = await freshStore()
    await s.addEntry({ date: '2025-09-02', type: 'expense', amountPence: 5000, description: 'Shell garage' })
    expect(s.getState().entries[0].claimable).toBe(false)
  })
  it('soft-deletes and restores', async () => {
    const s = await freshStore()
    await s.addEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
    const id = s.getState().entries[0].id
    await s.softDelete(id)
    expect(s.getState().entries[0].deletedAt).toBeTruthy()
    await s.restore(id)
    expect(s.getState().entries[0].deletedAt).toBeNull()
  })
  it('learns a merchant and applies it next time', async () => {
    const s = await freshStore()
    await s.learnMerchant('Hobgoblin Music', 'equipment')
    await s.addEntry({ date: '2025-09-03', type: 'expense', amountPence: 1500, description: 'HOBGOBLIN MUSIC LONDON' })
    expect(s.getState().entries[0].category).toBe('equipment')
  })
  it('regenerates home-office months from settings', async () => {
    const s = await freshStore()
    await s.setSettings({ hoursPerWeekAtHome: 30 })
    await s.regenerateHomeOffice('2025/26')
    const autos = s.getState().entries.filter(e => e.type === 'home_office')
    expect(autos).toHaveLength(12)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- store`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/state/store.ts
import type { StorageAdapter, AppData, Settings } from '../storage/storage'
import { makeEntry, type Entry } from '../domain/entry'
import { categorise } from '../domain/categoriser'
import { generateHomeOfficeMonths } from '../domain/homeOffice'
import { getRates } from '../config/taxYears'

type Listener = () => void

export function createStore(adapter: StorageAdapter) {
  let state: AppData
  const listeners = new Set<Listener>()
  const notify = () => listeners.forEach(l => l())
  const persist = async () => { await adapter.save(state); notify() }

  return {
    getState: () => state,
    subscribe(l: Listener) { listeners.add(l); return () => listeners.delete(l) },

    async init() { state = await adapter.load() },

    async addEntry(
      partial: Omit<Parameters<typeof makeEntry>[0], 'category'> & { category?: string },
    ) {
      let category = partial.category
      let claimable = partial.claimable ?? true
      if (partial.type === 'expense' && !category) {
        const r = categorise(partial.description, state.learnedMerchants)
        category = r.category
        claimable = r.claimable
      }
      const entry = makeEntry({ ...partial, category: category ?? 'uncategorised', claimable })
      state.entries.push(entry)
      await persist()
      return entry
    },

    async updateEntry(id: string, patch: Partial<Entry>) {
      state.entries = state.entries.map(e => (e.id === id ? { ...e, ...patch } : e))
      await persist()
    },

    async softDelete(id: string) {
      state.entries = state.entries.map(e => (e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e))
      await persist()
    },

    async restore(id: string) {
      state.entries = state.entries.map(e => (e.id === id ? { ...e, deletedAt: null } : e))
      await persist()
    },

    async purgeExpired(days = 30) {
      const cutoff = Date.now() - days * 86_400_000
      state.entries = state.entries.filter(e => !e.deletedAt || new Date(e.deletedAt).getTime() > cutoff)
      await persist()
    },

    async learnMerchant(merchant: string, category: string) {
      state.learnedMerchants[merchant.toLowerCase()] = category
      await persist()
    },

    async setSettings(patch: Partial<Settings>) {
      state.settings = { ...state.settings, ...patch }
      await persist()
    },

    async regenerateHomeOffice(taxYear: string) {
      state.entries = state.entries.filter(
        e => !(e.type === 'home_office' && e.source === 'auto' && e.date.startsWith(taxYear.slice(0, 4))),
      )
      const generated = generateHomeOfficeMonths(taxYear, state.settings.hoursPerWeekAtHome, getRates(taxYear))
      state.entries.push(...generated)
      await persist()
    },
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- store`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/state/store.ts tests/state/store.test.ts
git commit -m "feat: app store with CRUD, soft delete/undo, merchant learning, home-office regen"
```

---

### Task 15: i18n strings + shared UI components

**Files:**
- Create: `src/i18n/strings.ts`, `src/ui/components/BilingualLabel.tsx`, `src/ui/components/MoneyDisplay.tsx`, `src/ui/components/BigButton.tsx`
- Test: `tests/ui/components.test.tsx`

**Interfaces:**
- Consumes: `formatPounds`.
- Produces:
  - `strings` object: each key maps to `{ ko: string; en: string }`. Includes home-screen and button labels from spec §4.1.
  - `<BilingualLabel k="moneyIn" />` renders `수입 / Money in`.
  - `<MoneyDisplay pence={3000} />` renders `£30.00` (always positive).
  - `<BigButton icon label onClick />`.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/ui/components.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BilingualLabel } from '../../src/ui/components/BilingualLabel'
import { MoneyDisplay } from '../../src/ui/components/MoneyDisplay'

describe('BilingualLabel', () => {
  it('shows Korean then English', () => {
    render(<BilingualLabel k="moneyIn" />)
    expect(screen.getByText('수입 / Money in')).toBeInTheDocument()
  })
})

describe('MoneyDisplay', () => {
  it('shows positive pounds even for a negative value', () => {
    render(<MoneyDisplay pence={-3000} />)
    expect(screen.getByText('£30.00')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- components`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/i18n/strings.ts
export const strings = {
  moneyIn: { ko: '수입', en: 'Money in' },
  moneyOut: { ko: '지출', en: 'Money out' },
  whatsLeft: { ko: '남은 돈', en: "What's left" },
  estimatedTax: { ko: '예상 세금', en: 'Estimated tax' },
  estimateCaveat: { ko: '추정치입니다 — 최종 세금이 아닙니다.', en: 'This is an estimate to help you plan — not your final bill.' },
  gotPaid: { ko: '돈 받았어요', en: 'I got paid' },
  boughtSomething: { ko: '뭔가 샀어요', en: 'I bought something' },
  drove: { ko: '레슨하러 운전했어요', en: 'I drove to a lesson' },
  workedFromHome: { ko: '집에서 일했어요', en: 'I worked from home' },
  seeEverything: { ko: '전체 내역', en: 'See everything' },
  settings: { ko: '설정', en: 'Settings' },
  recentlyDeleted: { ko: '최근 삭제', en: 'Recently deleted' },
  undo: { ko: '되돌리기', en: 'Undo' },
} as const

export type StringKey = keyof typeof strings
export const bilingual = (k: StringKey) => `${strings[k].ko} / ${strings[k].en}`
```

```tsx
// src/ui/components/BilingualLabel.tsx
import { bilingual, type StringKey } from '../../i18n/strings'
export function BilingualLabel({ k }: { k: StringKey }) {
  return <span>{bilingual(k)}</span>
}
```

```tsx
// src/ui/components/MoneyDisplay.tsx
import { formatPounds } from '../../domain/money'
export function MoneyDisplay({ pence }: { pence: number }) {
  return <span className="money">{formatPounds(pence)}</span>
}
```

```tsx
// src/ui/components/BigButton.tsx
export function BigButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button className="big-button" onClick={onClick}>
      <span className="big-button__icon" aria-hidden>{icon}</span>
      <span className="big-button__label">{label}</span>
    </button>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- components`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/strings.ts src/ui/components/ tests/ui/components.test.tsx
git commit -m "feat: bilingual strings and shared UI components"
```

---

### Task 16: React store hook + summary panel

**Files:**
- Create: `src/state/useStore.ts`, `src/ui/SummaryPanel.tsx`
- Test: `tests/ui/summaryPanel.test.tsx`

**Interfaces:**
- Consumes: `createStore`, `summarise`, `currentTaxYear`, `MoneyDisplay`, `BilingualLabel`.
- Produces:
  - `StoreProvider` + `useStore()` React context hook exposing state and store actions, subscribing via `useSyncExternalStore`.
  - `<SummaryPanel taxYear />` — shows Money in / Money out / What's left / Estimated tax with the caveat. For a loss, shows a calm plain-language line instead of a negative "what's left".

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/summaryPanel.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryPanel } from '../../src/ui/SummaryPanel'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { StoreProvider } from '../../src/state/useStore'

async function renderWithData() {
  const store = createStore(createMemoryStorage())
  await store.init()
  await store.addEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
  render(<StoreProvider store={store}><SummaryPanel taxYear="2025/26" /></StoreProvider>)
}

describe('SummaryPanel', () => {
  it('shows income and the estimate caveat', async () => {
    await renderWithData()
    expect(screen.getByText('£30.00')).toBeInTheDocument()
    expect(screen.getByText(/estimate to help you plan/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- summaryPanel`
Expected: FAIL.

- [ ] **Step 3: Implement `useStore.ts` and `SummaryPanel.tsx`**

```tsx
// src/state/useStore.ts
import { createContext, useContext, useSyncExternalStore } from 'react'
import type { createStore } from './store'

type Store = ReturnType<typeof createStore>
const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ store, children }: { store: Store; children: React.ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)
  return { state, ...store }
}
```

```tsx
// src/ui/SummaryPanel.tsx
import { useStore } from '../state/useStore'
import { summarise } from '../domain/summary'
import { MoneyDisplay } from './components/MoneyDisplay'
import { bilingual, strings } from '../i18n/strings'

export function SummaryPanel({ taxYear }: { taxYear: string }) {
  const { state } = useStore()
  const s = summarise(state.entries, taxYear, state.settings.otherIncomePence)
  return (
    <section className="summary">
      <div><span>{bilingual('moneyIn')}</span> <MoneyDisplay pence={s.incomePence} /></div>
      <div><span>{bilingual('moneyOut')}</span> <MoneyDisplay pence={s.expensesPence} /></div>
      {s.estimate.isLoss ? (
        <div className="summary__loss">이번 해는 지출이 수입보다 많았어요. / This year your costs were higher than your income — that's okay.</div>
      ) : (
        <div><span>{bilingual('whatsLeft')}</span> <MoneyDisplay pence={s.profitPence} /></div>
      )}
      <div className="summary__tax">
        <span>{bilingual('estimatedTax')}:</span> <MoneyDisplay pence={s.estimate.totalPence} />
      </div>
      <p className="summary__caveat">{strings.estimateCaveat.ko} / {strings.estimateCaveat.en}</p>
    </section>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- summaryPanel`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/state/useStore.tsx src/ui/SummaryPanel.tsx tests/ui/summaryPanel.test.tsx
git commit -m "feat: React store hook and summary panel"
```

---

### Task 17: The four entry forms

**Files:**
- Create: `src/ui/forms/GotPaidForm.tsx`, `src/ui/forms/BoughtSomethingForm.tsx`, `src/ui/forms/DroveToLessonForm.tsx`, `src/ui/forms/WorkedFromHomeForm.tsx`
- Test: `tests/ui/forms.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `parsePence`, `mileagePence`, `getRates`, `currentTaxYear`, `categorise`.
- Produces four form components. Each takes `onDone: () => void`.
  - **GotPaidForm:** recent-payer buttons (derived from prior income entries: description + most recent amount, deduped); one tap adds today's income at that amount. "Someone new" reveals date/amount/name.
  - **BoughtSomethingForm:** date, amount, description; live category suggestion shown and overridable via a `<select>` of `CATEGORIES`; if `amountPence > settings.largePurchaseThresholdPence`, show business-use question (Only teaching / Also personal → 25/50/75/100) and store `details.fullAmountPence` + `details.businessSharePercent`, with `amountPence` scaled to the claimed share.
  - **DroveToLessonForm:** saved-journey buttons (from prior journey entries: destination + miles); one tap adds today's journey. "Somewhere new" reveals destination + miles, shows the calculated amount live, offers "save this journey".
  - **WorkedFromHomeForm:** shows current `hoursPerWeekAtHome`; lets her change it and calls `setSettings` then `regenerateHomeOffice(currentTaxYear())`.

- [ ] **Step 1: Write the failing tests** (behavioural, one per form)

```tsx
// tests/ui/forms.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { GotPaidForm } from '../../src/ui/forms/GotPaidForm'
import { BoughtSomethingForm } from '../../src/ui/forms/BoughtSomethingForm'
import { DroveToLessonForm } from '../../src/ui/forms/DroveToLessonForm'

async function mount(node: (store: ReturnType<typeof createStore>) => React.ReactElement) {
  const store = createStore(createMemoryStorage())
  await store.init()
  render(<StoreProvider store={store}>{node(store)}</StoreProvider>)
  return store
}

describe('GotPaidForm', () => {
  it('adds a new payment', async () => {
    const store = await mount(() => <GotPaidForm onDone={() => {}} />)
    fireEvent.click(screen.getByText(/someone new/i))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Emma' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(store.getState().entries.filter(e => e.type === 'income')).toHaveLength(1)
  })
})

describe('BoughtSomethingForm', () => {
  it('suggests a category from the description', async () => {
    await mount(() => <BoughtSomethingForm onDone={() => {}} />)
    fireEvent.change(screen.getByLabelText(/what/i), { target: { value: 'Sheet music' } })
    expect((screen.getByLabelText(/category/i) as HTMLSelectElement).value).toBe('equipment')
  })
})

describe('DroveToLessonForm', () => {
  it('shows a calculated amount for a new journey', async () => {
    await mount(() => <DroveToLessonForm onDone={() => {}} />)
    fireEvent.click(screen.getByText(/somewhere new/i))
    fireEvent.change(screen.getByLabelText(/miles/i), { target: { value: '6' } })
    expect(screen.getByText(/£2\.70/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- forms`
Expected: FAIL.

- [ ] **Step 3: Implement the four forms**

Implement each component per the Interfaces above. Key implementation notes so tests pass:
- Amount inputs use `parsePence`; reject `null` with an inline message and do not submit.
- `BoughtSomethingForm` computes the suggestion with `categorise(description, state.learnedMerchants)` on each description change and sets the `<select>` value; on submit, if the user changed the select away from the suggestion, call `learnMerchant(description, chosenCategory)`.
- `DroveToLessonForm` computes `mileagePence(miles, getRates(currentTaxYear()))` live and renders it via `MoneyDisplay`; the journey entry stores `details:{ destination, miles, ratePence }` and `category:'travel'`.
- Dates default to today (`new Date().toISOString().slice(0,10)`).
- Every form calls `onDone()` after a successful add.

Representative implementation for `DroveToLessonForm` (others follow the same shape):

```tsx
// src/ui/forms/DroveToLessonForm.tsx
import { useMemo, useState } from 'react'
import { useStore } from '../../state/useStore'
import { mileagePence } from '../../domain/mileage'
import { getRates } from '../../config/taxYears'
import { currentTaxYear } from '../../domain/taxYear'
import { MoneyDisplay } from '../components/MoneyDisplay'

export function DroveToLessonForm({ onDone }: { onDone: () => void }) {
  const { state, addEntry } = useStore()
  const [isNew, setIsNew] = useState(false)
  const [destination, setDestination] = useState('')
  const [miles, setMiles] = useState('')
  const rates = getRates(currentTaxYear())

  const saved = useMemo(() => {
    const seen = new Map<string, number>()
    for (const e of state.entries) {
      if (e.type === 'journey' && !e.deletedAt) {
        const d = (e.details ?? {}) as { destination?: string; miles?: number }
        if (d.destination && !seen.has(d.destination)) seen.set(d.destination, d.miles ?? 0)
      }
    }
    return [...seen.entries()]
  }, [state.entries])

  const milesNum = Number(miles) || 0
  const pence = mileagePence(milesNum, rates)

  async function add(dest: string, m: number) {
    await addEntry({
      date: new Date().toISOString().slice(0, 10),
      type: 'journey', amountPence: mileagePence(m, rates),
      description: `Drove to ${dest} / ${dest} 레슨`, category: 'travel',
      details: { destination: dest, miles: m, ratePence: rates.mileageHigherPencePerMile },
    })
    onDone()
  }

  return (
    <div>
      {saved.map(([dest, m]) => (
        <button key={dest} onClick={() => add(dest, m)}>{dest} — {m} miles</button>
      ))}
      {!isNew && <button onClick={() => setIsNew(true)}>Somewhere new / 새 장소</button>}
      {isNew && (
        <div>
          <label>Where to / 어디로<input value={destination} onChange={e => setDestination(e.target.value)} /></label>
          <label>Miles / 거리<input aria-label="miles" value={miles} onChange={e => setMiles(e.target.value)} /></label>
          <p>we worked this out for you: <MoneyDisplay pence={pence} /></p>
          <button onClick={() => add(destination, milesNum)}>Save / 저장</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- forms`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/forms/ tests/ui/forms.test.tsx
git commit -m "feat: four bilingual entry forms with shortcuts and live calcs"
```

---

### Task 18: Entry list, edit, recently deleted

**Files:**
- Create: `src/ui/EntryList.tsx`, `src/ui/EditEntry.tsx`, `src/ui/RecentlyDeleted.tsx`
- Test: `tests/ui/entryList.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `taxYearOf`, `CATEGORIES`, `MoneyDisplay`.
- Produces:
  - `<EntryList taxYear />` — non-deleted entries for the year, newest first, grouped by month; each row shows date, description, category label, amount, receipt indicator; clicking opens `<EditEntry>`. Auto home-office rows are labelled `자동 / auto`.
  - `<EditEntry entry onClose />` — edit date, amount, description, category; Save calls `updateEntry`; Delete calls `softDelete` and shows an inline Undo that calls `restore`.
  - `<RecentlyDeleted />` — soft-deleted entries with a Restore button.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/ui/entryList.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { EntryList } from '../../src/ui/EntryList'

async function mount() {
  const store = createStore(createMemoryStorage())
  await store.init()
  await store.addEntry({ date: '2025-09-01', type: 'income', amountPence: 3000, description: 'Emma', category: 'income' })
  render(<StoreProvider store={store}><EntryList taxYear="2025/26" /></StoreProvider>)
  return store
}

describe('EntryList', () => {
  it('lists an entry for the year', async () => {
    await mount()
    expect(screen.getByText('Emma')).toBeInTheDocument()
    expect(screen.getByText('£30.00')).toBeInTheDocument()
  })
  it('soft-deletes with undo', async () => {
    const store = await mount()
    fireEvent.click(screen.getByText('Emma'))
    fireEvent.click(screen.getByRole('button', { name: /delete|삭제/i }))
    expect(store.getState().entries[0].deletedAt).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /undo|되돌리기/i }))
    expect(store.getState().entries[0].deletedAt).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- entryList`
Expected: FAIL.

- [ ] **Step 3: Implement the three components** per the Interfaces above. Group rows by `date.slice(0,7)`; sort groups and rows descending by date. In `EditEntry`, after `softDelete`, render an inline `Undo` button wired to `restore(entry.id)` and keep it visible until `onClose`.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- entryList`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/EntryList.tsx src/ui/EditEntry.tsx src/ui/RecentlyDeleted.tsx tests/ui/entryList.test.tsx
git commit -m "feat: entry list, edit, and recently-deleted with undo"
```

---

### Task 19: Settings + guided first run

**Files:**
- Create: `src/ui/Settings.tsx`, `src/ui/FirstRun.tsx`
- Test: `tests/ui/settings.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `parsePence`, `pickFolder`, `regenerateHomeOffice`.
- Produces:
  - `<Settings />` — text size (normal/large/xlarge, applied to `document.documentElement` dataset), hours-per-week at home (triggers `regenerateHomeOffice`), other income (`parsePence`), large-purchase threshold, and a "Back up my records / 내 기록 백업" button.
  - `<FirstRun onComplete />` — three skippable screens (folder, home hours, other income); on completion sets `settings.folderChosen = true`.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/settings.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { Settings } from '../../src/ui/Settings'

async function mount() {
  const store = createStore(createMemoryStorage())
  await store.init()
  render(<StoreProvider store={store}><Settings /></StoreProvider>)
  return store
}

describe('Settings', () => {
  it('updates home hours and regenerates home-office entries', async () => {
    const store = await mount()
    fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: /save hours|시간 저장/i }))
    expect(store.getState().settings.hoursPerWeekAtHome).toBe(30)
    expect(store.getState().entries.filter(e => e.type === 'home_office')).toHaveLength(12)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- settings`
Expected: FAIL.

- [ ] **Step 3: Implement `Settings.tsx` and `FirstRun.tsx`.** The backup button, when File System Access is available, calls the folder handle path; in tests it is a no-op guarded by a `typeof window.showDirectoryPicker` check. Text size writes `document.documentElement.dataset.textSize`.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- settings`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/Settings.tsx src/ui/FirstRun.tsx tests/ui/settings.test.tsx
git commit -m "feat: settings and guided first-run"
```

---

### Task 20: Home screen + app shell + CSV download

**Files:**
- Create/Modify: `src/ui/HomeScreen.tsx`, `src/App.tsx`, `src/main.tsx`, `src/styles.css`
- Test: `tests/ui/homeScreen.test.tsx`

**Interfaces:**
- Consumes: everything above.
- Produces:
  - `<HomeScreen />` — `SummaryPanel` for `currentTaxYear()`, the four `BigButton`s opening the forms in a modal, quieter links to See everything / Settings / Recently deleted, a tax-year selector, and an "Export CSV / CSV 내보내기" button that builds `toCsv` and triggers a download (Blob + anchor).
  - `App.tsx` wires the `StoreProvider`, runs `store.init()`, shows `FirstRun` until `settings.folderChosen`, else `HomeScreen`.
  - High-contrast, large-text CSS driven by `data-text-size`.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/homeScreen.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { HomeScreen } from '../../src/ui/HomeScreen'

describe('HomeScreen', () => {
  it('shows the four action buttons', async () => {
    const store = createStore(createMemoryStorage())
    await store.init()
    render(<StoreProvider store={store}><HomeScreen /></StoreProvider>)
    expect(screen.getByText(/I got paid/)).toBeInTheDocument()
    expect(screen.getByText(/I bought something/)).toBeInTheDocument()
    expect(screen.getByText(/I drove to a lesson/)).toBeInTheDocument()
    expect(screen.getByText(/I worked from home/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- homeScreen`
Expected: FAIL.

- [ ] **Step 3: Implement `HomeScreen.tsx`, wire `App.tsx` and `main.tsx`, add `styles.css`.** CSV download builds `new Blob([toCsv(...)], {type:'text/csv'})`, creates an object URL, clicks a temporary anchor with `download="piano-accounts-<taxYear>.csv"`.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- homeScreen`
Expected: PASS. Then run the full suite: `npm test` — all green.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: home screen, app shell, and CSV download"
```

---

### Task 21: PWA install + manual end-to-end verification

**Files:**
- Create: `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `src/pwa.ts` (service worker registration), `sw.js`
- Modify: `index.html` (manifest link, theme-color), `vite.config.ts` if a PWA plugin is used
- Test: manual (PWA/File System APIs are unavailable under jsdom)

**Interfaces:**
- Produces: an installable PWA that opens standalone and persists to a chosen folder.

- [ ] **Step 1: Add the manifest**

```json
// public/manifest.webmanifest
{
  "name": "Piano Accounts / 피아노 회계",
  "short_name": "Piano Accounts",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b5bdb",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Link it in `index.html`: `<link rel="manifest" href="/manifest.webmanifest">` and `<meta name="theme-color" content="#3b5bdb">`. Add placeholder icons (any simple PNG at the two sizes).

- [ ] **Step 2: Register a minimal service worker** for offline app-shell caching (`sw.js` caching the built assets; register in `src/pwa.ts`, imported from `main.tsx`). A cache-first strategy for the app shell is sufficient; her data is never network-fetched.

- [ ] **Step 3: Build and serve**

```bash
npm run build && npm run preview
```

- [ ] **Step 4: Manual verification checklist** (in Chrome or Edge)

Confirm each, since these paths cannot be unit-tested:
- [ ] The install icon appears in the address bar; installing opens a standalone window.
- [ ] First run prompts for a folder; choosing one creates `data.json`.
- [ ] "I got paid" → new payment writes to `data.json` (open the file to confirm).
- [ ] A repeat-payer button appears on the next visit to "I got paid".
- [ ] "I bought something" with "Sheet music" suggests Equipment; a fuel purchase shows the not-counted note.
- [ ] "I drove to a lesson" shows a calculated amount and saves a reusable journey.
- [ ] Setting home hours generates 12 home-office rows in the list.
- [ ] Editing an entry's date moves it to the correct tax year in the selector.
- [ ] Delete → inline Undo restores; Recently deleted also restores.
- [ ] Export CSV downloads a file that opens cleanly in Excel.
- [ ] Attach a receipt photo to an expense; a file appears in `receipts/`.
- [ ] Reopen the app: all data reloads from the folder.
- [ ] "Back up my records" writes a copy; a weekly `backups/` file appears.
- [ ] Text-size control visibly enlarges the UI.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: PWA manifest, service worker, and install"
```

---

## Self-Review

**Spec coverage:**
- §4.1 home screen, four buttons, plain-positive money → Tasks 15, 16, 20 ✓
- §4.2 four forms incl. repeat payers, saved journeys, large-purchase share, auto home office → Task 17 ✓
- §4.3 see everything / edit / auto label → Task 18 ✓
- §4.4 guided first run → Task 19 ✓
- §4.5 comfort settings → Tasks 19, 20 ✓
- §5 data model, pence, calculated tax year, files, soft delete, batches → Tasks 5, 12, 13, 14 ✓ (import batches: field defined in Task 5, used in Plan 3)
- §6 categoriser incl. fuel exclusion + learned merchants → Task 6 ✓
- §7.1 mileage ✓ (7); §7.2 home office ✓ (8); §7.3 large purchase → Task 17 ✓; §7.4 tax estimate ✓ (9); §7.5 loss → Tasks 9, 16 ✓
- §7.6 contextual nudges → **Plan 2** (deferred)
- §8 bank import → **Plan 3** (deferred)
- §9 year-end box guide → **Plan 2**; CSV export → Task 11 ✓
- §10 help & guidance → **Plan 2**
- §11 platform/storage/backup → Tasks 12, 13, 21 ✓
- §12 verification → Task 4 gate ✓
- §13 error tolerance (edit/undo/date-move/auto editable/amounts) → Tasks 14, 17, 18 ✓
- §14 bilingual/large/contrast/printable → Tasks 15, 20 (print CSS folded into Task 20) ✓

**Placeholder scan:** No "TBD"/"handle edge cases" left. UI Tasks 17–20 reference the shared shape and give representative full code plus explicit per-component behaviour; each has runnable tests defining the contract.

**Type consistency:** `Entry`, `AppData`, `Settings`, `TaxYearRates`, `CategoriseResult`, `Summary`, `TaxEstimate` names and fields match across tasks. Store method names (`addEntry`, `updateEntry`, `softDelete`, `restore`, `learnMerchant`, `setSettings`, `regenerateHomeOffice`) are used consistently in Tasks 14, 16–20.

**Deferred to later plans (by design):** contextual nudges (§7.6), HMRC box mapping + filing walkthrough + before-you-file checklist (§9), help & guidance (§10) → Plan 2. Bank import (§8) → Plan 3.
