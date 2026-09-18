# Piano Accounts — Plan 2: Year-end & Guidance

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the record-keeper into something that helps her *file*: a bilingual box-by-box Self Assessment walkthrough with her actual numbers filled in, a before-you-file checklist, contextual money-saving nudges surfaced from her figures, and a plain-language help section — all local, all offline.

**Architecture:** Two pure domain modules (`filingFigures`, `nudges`) computed from the existing entries + tax-year config, with no UI/storage deps and unit-tested directly. Two dated config files (`sa103sBoxes`, `guidance`) whose HMRC-specific values carry verification gates. React screens on top, reached from the home screen, reusing Plan 1's components (MoneyDisplay, BilingualLabel, useStore) and conventions.

**Tech Stack:** TypeScript, React 18, Vite, Vitest. Builds on Plan 1 (branch `plan1-core`). No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-09-17-piano-accounts-design.md` (§7.5 losses, §7.6 nudges, §9 year-end, §10 help & guidance)

## Global Constraints

- **Money is integer pence everywhere.** Format to pounds only for display. (Spec §5.2)
- **Every user-facing label is bilingual, Korean first**, e.g. `수입 / Money in`, matching Plan 1's `bilingual()` helper and ruling R11.
- **Money displays as plain positive numbers** — no red, no minus signs. A loss is shown as calm plain-language, never a negative. (Spec §4.1, §7.5)
- **No tax rate, threshold, box number, or guidance figure is hardcoded in logic.** Rates/thresholds come from `src/config/taxYears.ts` (Plan 1); box numbers from `src/config/sa103sBoxes.ts`; guidance amounts reference config. (Spec §12)
- **HMRC box numbers, the filing-walkthrough steps, and guidance content MUST be verified against the live HMRC/GOV.UK pages at build time, not written from memory.** Each carries a verification gate. This is the spec's least-certain area (§12 items 4–6). (Spec §9.2, §12)
- **Everything is general information, not personal tax advice** — every guidance topic is dated and links to its GOV.UK source, and the year-end screens carry that disclaimer. (Spec §10.3)
- **Nudges appear only when her actual figures make them apply.** (Spec §7.6)
- **Both tax years 2025/26 and 2026/27** are supported (Plan 1 config). The filing walkthrough is per selected tax year.
- **Tests inspect store state after a click via `@testing-library/react` `waitFor`, never `setTimeout`; duplicated text via `getAllByText`.** (Plan 1 rulings)
- **Node 20+**, Chrome/Edge target.

---

## File Structure

```
src/
  config/
    sa103sBoxes.ts     # category-key → SA103S box {number,label} mapping + turnover/expenses/netProfit box ids (VERIFY vs HMRC)
    guidance.ts        # Good-to-know topics + Easy-to-miss items: bilingual body, GOV.UK url, checkedOn date (VERIFY)
  domain/
    filingFigures.ts   # figuresFor(entries, taxYear, settings) → SA103S box figures from claimable entries
    nudges.ts          # computeNudges(figures, settings, rates) → applicable nudges[]
  ui/
    YearEndScreen.tsx      # tax-year picker → figures + walkthrough + checklist + disclaimer
    FilingWalkthrough.tsx  # bilingual "type <amount> in <box>" steps with her numbers
    BeforeYouFile.tsx      # readiness checklist computed from entries
    NudgesPanel.tsx        # renders applicable nudges (also shown on HomeScreen)
    GoodToKnow.tsx         # collapsible guidance topics + Easy-to-miss list
  storage/storage.ts   # MODIFY: add spouseIsBasicRateTaxpayer to Settings + DEFAULT_SETTINGS
  ui/HomeScreen.tsx    # MODIFY: add links to Year-end and Good-to-know; mount NudgesPanel
tests/ mirrors src/ for domain + config + the UI screens
```

Plan 1 modules reused (do not modify their behaviour): `src/domain/summary.ts` (summarise), `src/domain/taxYear.ts` (taxYearOf, currentTaxYear, formatTaxYear), `src/config/taxYears.ts` (getRates, TaxYearRates, TAX_YEARS), `src/domain/entry.ts` (Entry), `src/domain/money.ts` (formatPounds), `src/state/useStore.tsx`, `src/ui/components/MoneyDisplay.tsx`, `src/i18n/strings.ts`.

---

### Task 1: SA103S box mapping config (VERIFICATION REQUIRED)

**Files:**
- Create: `src/config/sa103sBoxes.ts`
- Test: `tests/config/sa103sBoxes.test.ts`

**Interfaces:**
- Produces:
  - `interface Sa103Box { number: string; labelKo: string; labelEn: string }`
  - `const TURNOVER_BOX: Sa103Box` — the box her total income/turnover goes in.
  - `const EXPENSES_BOX: Sa103Box` — the single "total allowable expenses" box (SA103S permits a single total when turnover is under the VAT threshold; she is well under).
  - `const NET_PROFIT_BOX: Sa103Box` and `const NET_LOSS_BOX: Sa103Box`.
  - `const CATEGORY_BOX_NOTES: Record<string, {labelKo:string; labelEn:string}>` — a per-category human note for the expenses breakdown (reference only; all claimable expenses total into EXPENSES_BOX).
  - `getBox(key: 'turnover'|'expenses'|'netProfit'|'netLoss'): Sa103Box`.

> **VERIFICATION GATE — do not skip.** Confirm the box numbers and labels against the CURRENT SA103S form and its notes before marking done. Do not trust memory. Sources:
> - SA103S form: search GOV.UK for "Self-employment (short) SA103S" (the fillable PDF for the relevant tax year).
> - SA103S notes: "Self-employment (short) notes".
> Confirm: which box number is **turnover** (income), which box is **total allowable expenses** (the single-figure box available when turnover is below the VAT-registration threshold), and which boxes are **net profit** and **net loss**. Record the form year you checked and each box number in the report. If the box numbers differ between 2025/26 and 2026/27 forms, note it; the config is editable and this app targets the 2025/26 return (filed by 31 Jan 2027) primarily.

- [ ] **Step 1: Write the failing test** (structure + lookup, not the disputed numbers)

```ts
// tests/config/sa103sBoxes.test.ts
import { describe, it, expect } from 'vitest'
import { getBox, TURNOVER_BOX, EXPENSES_BOX, NET_PROFIT_BOX } from '../../src/config/sa103sBoxes'

describe('sa103sBoxes', () => {
  it('exposes turnover/expenses/netProfit boxes with bilingual labels', () => {
    for (const box of [TURNOVER_BOX, EXPENSES_BOX, NET_PROFIT_BOX]) {
      expect(box.number).toMatch(/\d/)
      expect(box.labelKo.length).toBeGreaterThan(0)
      expect(box.labelEn.length).toBeGreaterThan(0)
    }
  })
  it('getBox looks up by role', () => {
    expect(getBox('turnover')).toBe(TURNOVER_BOX)
    expect(getBox('expenses')).toBe(EXPENSES_BOX)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- sa103sBoxes`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement with best-effort verified values**

```ts
// src/config/sa103sBoxes.ts
// SA103S box numbers/labels — VERIFY against the current HMRC SA103S form + notes.
// This app targets the 2025/26 self-employment (short) return.
export interface Sa103Box { number: string; labelKo: string; labelEn: string }

// NOTE TO IMPLEMENTER: confirm each `number` below against the live SA103S form.
export const TURNOVER_BOX: Sa103Box = {
  number: '9',
  labelKo: '매출(총 수입)',
  labelEn: 'Your turnover (total takings)',
}
export const EXPENSES_BOX: Sa103Box = {
  number: '20',
  labelKo: '총 필요경비',
  labelEn: 'Total allowable expenses',
}
export const NET_PROFIT_BOX: Sa103Box = {
  number: '21',
  labelKo: '순이익',
  labelEn: 'Net profit',
}
export const NET_LOSS_BOX: Sa103Box = {
  number: '22',
  labelKo: '순손실',
  labelEn: 'Net loss',
}

export const CATEGORY_BOX_NOTES: Record<string, { labelKo: string; labelEn: string }> = {
  travel: { labelKo: '교통비', labelEn: 'Travel (incl. mileage)' },
  equipment: { labelKo: '악기·교재', labelEn: 'Equipment & materials' },
  professional: { labelKo: '회비·보험', labelEn: 'Professional fees & insurance' },
  marketing: { labelKo: '홍보', labelEn: 'Marketing' },
  home_office: { labelKo: '재택근무', labelEn: 'Working from home' },
  training: { labelKo: '교육·연수', labelEn: 'Training & CPD' },
  uncategorised: { labelKo: '확인 필요', labelEn: 'Needs checking' },
}

const BY_ROLE = {
  turnover: TURNOVER_BOX,
  expenses: EXPENSES_BOX,
  netProfit: NET_PROFIT_BOX,
  netLoss: NET_LOSS_BOX,
} as const

export function getBox(role: keyof typeof BY_ROLE): Sa103Box {
  return BY_ROLE[role]
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- sa103sBoxes`
Expected: PASS.

- [ ] **Step 5: Verify box numbers against the live SA103S form**

Open the current SA103S form + notes on GOV.UK. Confirm/correct every `number`. Record the form year and each confirmed box in the report. Re-run tests.

- [ ] **Step 6: Commit**

```bash
git add src/config/sa103sBoxes.ts tests/config/sa103sBoxes.test.ts
git commit -m "feat: SA103S box mapping config (HMRC-verified)"
```

---

### Task 2: Filing figures domain

**Files:**
- Create: `src/domain/filingFigures.ts`
- Test: `tests/domain/filingFigures.test.ts`

**Interfaces:**
- Consumes: `Entry` (entry.ts), `taxYearOf` (taxYear.ts), `Sa103Box` + boxes (sa103sBoxes.ts).
- Produces:
  - `interface CategoryTotal { key: string; amountPence: number }`
  - `interface FilingFigures { taxYear: string; turnoverPence: number; expensesPence: number; netPence: number; isLoss: boolean; byCategory: CategoryTotal[] }`
  - `figuresFor(entries: Entry[], taxYear: string): FilingFigures` — over non-deleted, claimable entries whose `taxYearOf(date)===taxYear`: turnover = sum of `income` type; expenses = sum of all non-income claimable amounts; net = turnover − expenses; `isLoss = net < 0`; `byCategory` groups claimable expense amounts by `category` (descending by amount) for the reference breakdown.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/filingFigures.test.ts
import { describe, it, expect } from 'vitest'
import { figuresFor } from '../../src/domain/filingFigures'
import { makeEntry } from '../../src/domain/entry'

const entries = [
  makeEntry({ date: '2025-09-01', type: 'income', amountPence: 300000, description: 'lessons', category: 'income' }),
  makeEntry({ date: '2025-09-02', type: 'expense', amountPence: 20000, description: 'sheet music', category: 'equipment' }),
  makeEntry({ date: '2025-09-03', type: 'journey', amountPence: 5000, description: 'Mrs Patel', category: 'travel' }),
  makeEntry({ date: '2025-09-04', type: 'expense', amountPence: 9000, description: 'Shell', category: 'travel', claimable: false }),
  makeEntry({ date: '2024-09-01', type: 'income', amountPence: 99999, description: 'last year', category: 'income' }),
]

describe('figuresFor', () => {
  it('computes turnover, expenses and net for the year', () => {
    const f = figuresFor(entries, '2025/26')
    expect(f.turnoverPence).toBe(300000)
    expect(f.expensesPence).toBe(25000) // 20000 + 5000; fuel excluded
    expect(f.netPence).toBe(275000)
    expect(f.isLoss).toBe(false)
  })
  it('groups claimable expenses by category', () => {
    const f = figuresFor(entries, '2025/26')
    const eq = f.byCategory.find(c => c.key === 'equipment')
    const tr = f.byCategory.find(c => c.key === 'travel')
    expect(eq?.amountPence).toBe(20000)
    expect(tr?.amountPence).toBe(5000)
  })
  it('reports a loss when expenses exceed turnover', () => {
    const loss = [
      makeEntry({ date: '2025-05-01', type: 'income', amountPence: 10000, description: 'x', category: 'income' }),
      makeEntry({ date: '2025-05-02', type: 'expense', amountPence: 600000, description: 'piano', category: 'equipment' }),
    ]
    const f = figuresFor(loss, '2025/26')
    expect(f.isLoss).toBe(true)
    expect(f.netPence).toBe(-590000)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- filingFigures`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/domain/filingFigures.ts
import type { Entry } from './entry'
import { taxYearOf } from './taxYear'

export interface CategoryTotal { key: string; amountPence: number }
export interface FilingFigures {
  taxYear: string
  turnoverPence: number
  expensesPence: number
  netPence: number
  isLoss: boolean
  byCategory: CategoryTotal[]
}

export function figuresFor(entries: Entry[], taxYear: string): FilingFigures {
  const live = entries.filter(e => !e.deletedAt && e.claimable && taxYearOf(e.date) === taxYear)
  let turnoverPence = 0
  let expensesPence = 0
  const cat = new Map<string, number>()
  for (const e of live) {
    if (e.type === 'income') {
      turnoverPence += e.amountPence
    } else {
      expensesPence += e.amountPence
      cat.set(e.category, (cat.get(e.category) ?? 0) + e.amountPence)
    }
  }
  const netPence = turnoverPence - expensesPence
  const byCategory = [...cat.entries()]
    .map(([key, amountPence]) => ({ key, amountPence }))
    .sort((a, b) => b.amountPence - a.amountPence)
  return { taxYear, turnoverPence, expensesPence, netPence, isLoss: netPence < 0, byCategory }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- filingFigures`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/filingFigures.ts tests/domain/filingFigures.test.ts
git commit -m "feat: SA103S filing figures from entries"
```

---

### Task 3: Settings spouse flag + nudges domain

**Files:**
- Modify: `src/storage/storage.ts` (add `spouseIsBasicRateTaxpayer` to `Settings` + `DEFAULT_SETTINGS`)
- Create: `src/domain/nudges.ts`
- Test: `tests/domain/nudges.test.ts`

**Interfaces:**
- Consumes: `FilingFigures` (filingFigures.ts), `Settings` (storage.ts), `TaxYearRates` (taxYears.ts).
- Produces:
  - `type NudgeId = 'must_file' | 'state_pension' | 'trading_allowance' | 'marriage_allowance'`
  - `interface Nudge { id: NudgeId; titleKo: string; titleEn: string; bodyKo: string; bodyEn: string; govUkUrl: string }`
  - `computeNudges(figures: FilingFigures, settings: Settings, rates: TaxYearRates): Nudge[]` — returns only nudges whose conditions hold (see rules below).
- Settings gains `spouseIsBasicRateTaxpayer: boolean` (default `false`).

**Nudge rules** (all thresholds from `rates`, never hardcoded):
- `must_file`: `figures.turnoverPence > rates.tradingAllowancePence` → she must register & file.
- `state_pension`: `figures.netPence > 0 && figures.netPence < rates.smallProfitsThresholdPence` → voluntary Class 2 (rate `rates.class2WeeklyPence`) keeps the year counting for State Pension.
- `trading_allowance`: `figures.turnoverPence > rates.tradingAllowancePence && figures.expensesPence < rates.tradingAllowancePence` → claiming the £1,000 trading allowance beats itemised expenses; both profit figures worth comparing.
- `marriage_allowance`: `(settings.otherIncomePence + Math.max(0, figures.netPence)) < rates.personalAllowancePence && settings.spouseIsBasicRateTaxpayer` → transfer part of unused allowance (worth `rates.marriageAllowanceBenefitPence`, backdatable).

- [ ] **Step 1: Write the failing tests**

```ts
// tests/domain/nudges.test.ts
import { describe, it, expect } from 'vitest'
import { computeNudges } from '../../src/domain/nudges'
import { getRates } from '../../src/config/taxYears'
import { DEFAULT_SETTINGS } from '../../src/storage/storage'
import type { FilingFigures } from '../../src/domain/filingFigures'

const r = getRates('2025/26')
const fig = (turnover: number, expenses: number): FilingFigures => ({
  taxYear: '2025/26', turnoverPence: turnover, expensesPence: expenses,
  netPence: turnover - expenses, isLoss: turnover - expenses < 0, byCategory: [],
})

describe('computeNudges', () => {
  it('shows must_file once turnover exceeds the trading allowance', () => {
    const ids = computeNudges(fig(500000, 100000), DEFAULT_SETTINGS, r).map(n => n.id)
    expect(ids).toContain('must_file')
  })
  it('shows state_pension when profit is positive but below the small profits threshold', () => {
    const ids = computeNudges(fig(600000, 100000), DEFAULT_SETTINGS, r).map(n => n.id) // profit 500000 < SPT
    expect(ids).toContain('state_pension')
  })
  it('shows trading_allowance when expenses are under £1,000', () => {
    const ids = computeNudges(fig(500000, 50000), DEFAULT_SETTINGS, r).map(n => n.id)
    expect(ids).toContain('trading_allowance')
  })
  it('shows marriage_allowance only when income is under the allowance AND spouse is basic-rate', () => {
    const low = fig(800000, 100000) // net 700000 < personal allowance
    expect(computeNudges(low, DEFAULT_SETTINGS, r).map(n => n.id)).not.toContain('marriage_allowance')
    const withSpouse = { ...DEFAULT_SETTINGS, spouseIsBasicRateTaxpayer: true }
    expect(computeNudges(low, withSpouse, r).map(n => n.id)).toContain('marriage_allowance')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- nudges`
Expected: FAIL.

- [ ] **Step 3: Add the Settings field, then implement nudges**

In `src/storage/storage.ts`, add `spouseIsBasicRateTaxpayer: boolean` to the `Settings` interface and `spouseIsBasicRateTaxpayer: false` to `DEFAULT_SETTINGS`.

```ts
// src/domain/nudges.ts
import type { FilingFigures } from './filingFigures'
import type { Settings } from '../storage/storage'
import type { TaxYearRates } from '../config/taxYears'

export type NudgeId = 'must_file' | 'state_pension' | 'trading_allowance' | 'marriage_allowance'
export interface Nudge {
  id: NudgeId
  titleKo: string; titleEn: string
  bodyKo: string; bodyEn: string
  govUkUrl: string
}

export function computeNudges(figures: FilingFigures, settings: Settings, rates: TaxYearRates): Nudge[] {
  const out: Nudge[] = []

  if (figures.turnoverPence > rates.tradingAllowancePence) {
    out.push({
      id: 'must_file',
      titleKo: '세금 신고를 해야 해요', titleEn: 'You need to file a tax return',
      bodyKo: '수입이 £1,000을 넘으면 예상 세금이 £0이라도 자영업 등록과 자기평가 신고가 필요해요. 마감일: 1월 31일.',
      bodyEn: 'Once your income passes £1,000 you must register as self-employed and file a Self Assessment, even if the estimated tax is £0. Deadline: 31 January.',
      govUkUrl: 'https://www.gov.uk/self-assessment-tax-returns',
    })
  }

  if (figures.netPence > 0 && figures.netPence < rates.smallProfitsThresholdPence) {
    out.push({
      id: 'state_pension',
      titleKo: '국가연금 — 자발적 납부를 고려하세요', titleEn: 'State Pension — consider voluntary contributions',
      bodyKo: '이익이 소액이익 기준보다 낮으면 국민보험 크레딧이 자동으로 쌓이지 않아요. 자발적 Class 2 납부로 그 해를 국가연금에 반영할 수 있어요.',
      bodyEn: 'Your profit is below the small profits threshold, so you do not get an automatic National Insurance credit. Paying voluntary Class 2 contributions keeps this year counting towards your State Pension.',
      govUkUrl: 'https://www.gov.uk/self-employed-national-insurance-rates',
    })
  }

  if (figures.turnoverPence > rates.tradingAllowancePence && figures.expensesPence < rates.tradingAllowancePence) {
    out.push({
      id: 'trading_allowance',
      titleKo: '£1,000 거래 공제가 더 유리할 수 있어요', titleEn: 'The £1,000 trading allowance may be better',
      bodyKo: '올해 경비가 £1,000보다 적어요. 실제 경비 대신 £1,000 거래 공제를 청구하면 세금이 더 줄 수 있어요. 두 가지를 비교해 보세요.',
      bodyEn: 'Your expenses this year are under £1,000. Claiming the flat £1,000 trading allowance instead of your actual expenses may reduce your tax more. Worth comparing both.',
      govUkUrl: 'https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income',
    })
  }

  const totalIncome = settings.otherIncomePence + Math.max(0, figures.netPence)
  if (totalIncome < rates.personalAllowancePence && settings.spouseIsBasicRateTaxpayer) {
    out.push({
      id: 'marriage_allowance',
      titleKo: '결혼 수당 — 남은 공제를 배우자에게 이전', titleEn: 'Marriage Allowance — transfer unused allowance',
      bodyKo: '소득이 개인공제보다 적고 배우자가 기본세율 납세자라면, 남은 개인공제의 일부를 배우자에게 이전해 매년 약 £252를 절약할 수 있어요. 최대 4년까지 소급 가능해요.',
      bodyEn: 'Your income is below the personal allowance and your spouse is a basic-rate taxpayer, so you can transfer part of your unused allowance to them — worth about £252 a year, and you can backdate it up to four years.',
      govUkUrl: 'https://www.gov.uk/marriage-allowance',
    })
  }

  return out
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- nudges`
Expected: PASS. Also run `npm test -- memoryStorage store settings` to confirm the new Settings default did not break Plan 1 tests.

- [ ] **Step 5: Commit**

```bash
git add src/storage/storage.ts src/domain/nudges.ts tests/domain/nudges.test.ts
git commit -m "feat: contextual nudges + spouse-basic-rate setting"
```

---

### Task 4: Guidance content config (VERIFICATION REQUIRED)

**Files:**
- Create: `src/config/guidance.ts`
- Test: `tests/config/guidance.test.ts`

**Interfaces:**
- Produces:
  - `interface GuidanceTopic { id: string; titleKo: string; titleEn: string; bodyKo: string; bodyEn: string; govUkUrl: string; checkedOn: string }`
  - `const GOOD_TO_KNOW: GuidanceTopic[]` — topics from spec §10.1: what being self-employed means (register/UTR), what you can claim (six categories + mileage-replaces-petrol + home-office + buying a piano), key dates (5 Oct register, 31 Jan file+pay, 5 Apr year end), words you might see (glossary: turnover, profit, allowance, Self Assessment, cash basis, Class 4).
  - `const GLOSSARY: { termKo: string; termEn: string; meaningKo: string; meaningEn: string }[]`.

> **VERIFICATION GATE — do not skip.** Confirm every date, threshold, and factual claim against the linked GOV.UK page, and set `checkedOn` to today's date (2026-09-18) for each topic. Key pages: /register-for-self-assessment, /self-assessment-tax-returns (deadlines), /simpler-income-tax-cash-basis, /self-employed-national-insurance-rates, /expenses-if-youre-self-employed. Do not invent URLs — confirm each resolves.

- [ ] **Step 1: Write the failing tests** (structure + provenance, not prose)

```ts
// tests/config/guidance.test.ts
import { describe, it, expect } from 'vitest'
import { GOOD_TO_KNOW, GLOSSARY } from '../../src/config/guidance'

describe('guidance config', () => {
  it('every topic is bilingual, dated, and links to gov.uk', () => {
    expect(GOOD_TO_KNOW.length).toBeGreaterThanOrEqual(4)
    for (const t of GOOD_TO_KNOW) {
      expect(t.titleKo && t.titleEn && t.bodyKo && t.bodyEn).toBeTruthy()
      expect(t.govUkUrl).toMatch(/^https:\/\/www\.gov\.uk\//)
      expect(t.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
  it('glossary defines the core jargon bilingually', () => {
    const terms = GLOSSARY.map(g => g.termEn.toLowerCase())
    expect(terms).toEqual(expect.arrayContaining(['turnover', 'profit', 'allowance']))
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- guidance`
Expected: FAIL.

- [ ] **Step 3: Implement the content** (bilingual, plain language). Provide at least the four topics and the glossary. Each `bodyEn`/`bodyKo` is 2–4 plain sentences (no jargon beyond the glossary). Set `checkedOn: '2026-09-18'`. Use these GOV.UK URLs (verify each resolves): registering `https://www.gov.uk/register-for-self-assessment`, deadlines `https://www.gov.uk/self-assessment-tax-returns`, cash basis `https://www.gov.uk/simpler-income-tax-cash-basis`, expenses `https://www.gov.uk/expenses-if-youre-self-employed`. Write real, complete prose for each topic — no placeholders.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- guidance`
Expected: PASS.

- [ ] **Step 5: Verify content against GOV.UK**

Open each page; confirm the dates (5 Oct register / 31 Jan file+pay / 5 Apr year end), the cash-basis "deduct equipment in the year you buy it" claim, and that mileage vs actual-petrol is one-or-the-other. Correct any wording. Confirm each URL resolves.

- [ ] **Step 6: Commit**

```bash
git add src/config/guidance.ts tests/config/guidance.test.ts
git commit -m "feat: bilingual self-employment guidance content (GOV.UK-verified)"
```

---

### Task 5: NudgesPanel UI

**Files:**
- Create: `src/ui/NudgesPanel.tsx`
- Test: `tests/ui/nudgesPanel.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `figuresFor`, `computeNudges`, `getRates`, `Nudge`.
- Produces: `<NudgesPanel taxYear />` — computes figures + nudges for the tax year and renders each applicable nudge as a calm card: bilingual title + body + a "자세히 / Learn more" link to `govUkUrl` (opens in a new tab, `rel="noreferrer"`). Renders nothing when there are no nudges.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/nudgesPanel.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { NudgesPanel } from '../../src/ui/NudgesPanel'

async function mountWith(incomePence: number) {
  const store = createStore(createMemoryStorage())
  await store.init()
  await store.addEntry({ date: '2025-09-01', type: 'income', amountPence: incomePence, description: 'lessons', category: 'income' })
  render(<StoreProvider store={store}><NudgesPanel taxYear="2025/26" /></StoreProvider>)
}

describe('NudgesPanel', () => {
  it('shows the must-file nudge for a real income', async () => {
    await mountWith(500000)
    expect(screen.getByText(/need to file a tax return/i)).toBeInTheDocument()
  })
  it('renders nothing when income is below the trading allowance', async () => {
    await mountWith(50000) // £500 turnover, profit below SPT triggers state_pension though
    // must_file should NOT appear
    expect(screen.queryByText(/need to file a tax return/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- nudgesPanel`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/ui/NudgesPanel.tsx
import { useStore } from '../state/useStore'
import { figuresFor } from '../domain/filingFigures'
import { computeNudges } from '../domain/nudges'
import { getRates } from '../config/taxYears'

export function NudgesPanel({ taxYear }: { taxYear: string }) {
  const { state } = useStore()
  const figures = figuresFor(state.entries, taxYear)
  const nudges = computeNudges(figures, state.settings, getRates(taxYear))
  if (nudges.length === 0) return null
  return (
    <section className="nudges" aria-label="놓치기 쉬운 것 / Easy to miss">
      {nudges.map(n => (
        <div key={n.id} className="nudge-card">
          <h3>{n.titleKo} / {n.titleEn}</h3>
          <p>{n.bodyKo}</p>
          <p>{n.bodyEn}</p>
          <a href={n.govUkUrl} target="_blank" rel="noreferrer">자세히 / Learn more</a>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- nudgesPanel`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/NudgesPanel.tsx tests/ui/nudgesPanel.test.tsx
git commit -m "feat: contextual nudges panel"
```

---

### Task 6: GoodToKnow UI

**Files:**
- Create: `src/ui/GoodToKnow.tsx`
- Test: `tests/ui/goodToKnow.test.tsx`

**Interfaces:**
- Consumes: `GOOD_TO_KNOW`, `GLOSSARY` (guidance.ts).
- Produces: `<GoodToKnow />` — a heading `알아두기 / Good to know`, each topic as a collapsible `<details><summary>{titleKo} / {titleEn}</summary>` with bilingual body + a GOV.UK link + a small "확인일 / checked {checkedOn}" line; a glossary section `words you might see` listing each term + meaning bilingually; and the disclaimer `일반 정보이며 세무 자문이 아닙니다 / General information, not personal tax advice.`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/goodToKnow.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoodToKnow } from '../../src/ui/GoodToKnow'

describe('GoodToKnow', () => {
  it('renders topics and the not-advice disclaimer', () => {
    render(<GoodToKnow />)
    expect(screen.getByText(/Good to know/i)).toBeInTheDocument()
    expect(screen.getByText(/not personal tax advice/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- goodToKnow`
Expected: FAIL.

- [ ] **Step 3: Implement** per the Interfaces above. Map `GOOD_TO_KNOW` to `<details>` elements and `GLOSSARY` to a definition list. Include the bilingual disclaimer line.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- goodToKnow`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/GoodToKnow.tsx tests/ui/goodToKnow.test.tsx
git commit -m "feat: Good-to-know guidance screen"
```

---

### Task 7: FilingWalkthrough UI

**Files:**
- Create: `src/ui/FilingWalkthrough.tsx`
- Test: `tests/ui/filingWalkthrough.test.tsx`

**Interfaces:**
- Consumes: `FilingFigures`, `getBox`, `CATEGORY_BOX_NOTES` (sa103sBoxes.ts), `MoneyDisplay`, `formatPounds`, `CATEGORIES` (categories.ts for labels).
- Produces: `<FilingWalkthrough figures={FilingFigures} />` — an ordered, printable list of steps. Each step: the HMRC box (`{box.number}`), the bilingual box label, and the amount to type shown via `MoneyDisplay`. Steps: (1) turnover box = `figures.turnoverPence`; (2) total allowable expenses box = `figures.expensesPence`, with the `byCategory` breakdown shown beneath as reference (labelled "참고 / for your records"); (3) net profit box = `figures.netPence` if not a loss, else the net loss box with the loss amount and a calm plain-language note that a loss can usually be carried forward. A leading step explains registering/logging in at GOV.UK. Amounts printed as whole pounds are acceptable for the box list (HMRC boxes take pounds), but show pence-accurate via MoneyDisplay.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/ui/filingWalkthrough.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilingWalkthrough } from '../../src/ui/FilingWalkthrough'
import type { FilingFigures } from '../../src/domain/filingFigures'

const profit: FilingFigures = {
  taxYear: '2025/26', turnoverPence: 842000, expensesPence: 193000,
  netPence: 649000, isLoss: false, byCategory: [{ key: 'equipment', amountPence: 120000 }],
}

describe('FilingWalkthrough', () => {
  it('shows turnover, expenses and net-profit amounts with their box numbers', () => {
    render(<FilingWalkthrough figures={profit} />)
    expect(screen.getByText('£8,420.00')).toBeInTheDocument()
    expect(screen.getByText('£1,930.00')).toBeInTheDocument()
    expect(screen.getByText('£6,490.00')).toBeInTheDocument()
  })
  it('shows a calm loss message instead of a negative for a loss year', () => {
    const loss: FilingFigures = { ...profit, netPence: -50000, isLoss: true }
    render(<FilingWalkthrough figures={loss} />)
    expect(screen.getByText(/carried forward|다음 해/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- filingWalkthrough`
Expected: FAIL.

- [ ] **Step 3: Implement** per the Interfaces. For the loss branch, render `MoneyDisplay pence={Math.abs(netPence)}` in the net-loss box step plus a bilingual line: `손실은 보통 다음 해 이익에서 공제할 수 있어요 / A loss can usually be carried forward against next year's profit.` Every label Korean-first.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- filingWalkthrough`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/FilingWalkthrough.tsx tests/ui/filingWalkthrough.test.tsx
git commit -m "feat: bilingual box-by-box filing walkthrough"
```

---

### Task 8: BeforeYouFile checklist UI

**Files:**
- Create: `src/ui/BeforeYouFile.tsx`
- Test: `tests/ui/beforeYouFile.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `taxYearOf`, `taxYearBounds` (taxYear.ts), `Entry`.
- Produces: `<BeforeYouFile taxYear />` — a readiness checklist computed from entries for the year. Each item shows ✓ (ok) or a bilingual warning:
  - **Any months with no income logged?** — of the 12 months in the tax year, list any month with zero `income` entries (she may simply not have taught, but worth flagging).
  - **Any entries still "Needs checking"?** — count entries with `category === 'uncategorised'`.
  - **Any large purchase without a receipt?** — expense entries with `amountPence >= settings.largePurchaseThresholdPence` and no `receiptFile`.
  - **Home office confirmed?** — whether any `home_office` entry exists for the year.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/beforeYouFile.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { BeforeYouFile } from '../../src/ui/BeforeYouFile'

async function mount() {
  const store = createStore(createMemoryStorage())
  await store.init()
  await store.addEntry({ date: '2025-09-02', type: 'expense', amountPence: 2000, description: 'mystery', category: 'uncategorised' })
  render(<StoreProvider store={store}><BeforeYouFile taxYear="2025/26" /></StoreProvider>)
}

describe('BeforeYouFile', () => {
  it('flags uncategorised entries', async () => {
    await mount()
    expect(screen.getByText(/needs checking|확인 필요/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- beforeYouFile`
Expected: FAIL.

- [ ] **Step 3: Implement** per the Interfaces. Compute the four checks over `state.entries` filtered to the year; render each as a row with a bilingual label and a ✓ or a warning count. Korean-first labels.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- beforeYouFile`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/BeforeYouFile.tsx tests/ui/beforeYouFile.test.tsx
git commit -m "feat: before-you-file readiness checklist"
```

---

### Task 9: YearEndScreen + home-screen wiring

**Files:**
- Create: `src/ui/YearEndScreen.tsx`
- Modify: `src/ui/HomeScreen.tsx` (add links to Year-end + Good-to-know; mount NudgesPanel)
- Test: `tests/ui/yearEndScreen.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `figuresFor`, `FilingWalkthrough`, `BeforeYouFile`, `NudgesPanel`, `formatTaxYear`, `TAX_YEARS` (taxYears.ts), `MoneyDisplay`.
- Produces: `<YearEndScreen />` — a tax-year selector (default `currentTaxYear()`; options from `Object.keys(TAX_YEARS)`), a summary line (turnover/expenses/net via MoneyDisplay, loss shown calmly), then `NudgesPanel`, `BeforeYouFile`, and `FilingWalkthrough` for the selected year, and the not-advice disclaimer. Printable. HomeScreen gains quieter links: `연말 정산 / Year-end & filing` → YearEndScreen, `알아두기 / Good to know` → GoodToKnow, and mounts `<NudgesPanel taxYear={currentTaxYear()} />` under the summary.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/yearEndScreen.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreProvider } from '../../src/state/useStore'
import { createStore } from '../../src/state/store'
import { createMemoryStorage } from '../../src/storage/memoryStorage'
import { YearEndScreen } from '../../src/ui/YearEndScreen'

describe('YearEndScreen', () => {
  it('renders the filing walkthrough and disclaimer', async () => {
    const store = createStore(createMemoryStorage())
    await store.init()
    await store.addEntry({ date: '2025-09-01', type: 'income', amountPence: 842000, description: 'lessons', category: 'income' })
    render(<StoreProvider store={store}><YearEndScreen /></StoreProvider>)
    // default year is current (2026/27); switch handled inside — assert disclaimer + a turnover figure appear
    expect(screen.getByText(/not personal tax advice/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- yearEndScreen`
Expected: FAIL.

- [ ] **Step 3: Implement** `YearEndScreen.tsx` and wire `HomeScreen.tsx`. The year selector sets local state feeding `figuresFor`/child components. Keep HomeScreen's existing tests green — add the new links without removing existing buttons/labels. Korean-first labels throughout.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- yearEndScreen homeScreen`
Expected: PASS. Then run the FULL suite `npm test` and `npm run build`.

- [ ] **Step 5: Commit**

```bash
git add src/ui/YearEndScreen.tsx src/ui/HomeScreen.tsx tests/ui/yearEndScreen.test.tsx
git commit -m "feat: year-end screen wired into home"
```

---

## Self-Review

**Spec coverage:**
- §7.5 losses (calm plain-language, carry-forward note) → Tasks 2, 7 ✓
- §7.6 contextual nudges (state pension, must-file, trading allowance, marriage allowance) → Tasks 3, 5 ✓
- §9.1 filing walkthrough with her numbers → Task 7 ✓
- §9.2 category → SA103S box mapping (editable, VERIFY) → Task 1 ✓
- §9.3 CSV export → already delivered in Plan 1 (no task here) ✓
- §9.4 before-you-file checklist → Task 8 ✓
- §10.1 Good-to-know topics + glossary → Tasks 4, 6 ✓
- §10.2 Easy-to-miss (the nudges, browsable) → Tasks 5, 9 (NudgesPanel on home + year-end) ✓
- §10.3 not-advice disclaimer, dated + GOV.UK-linked → Tasks 4, 6, 9 ✓
- §12 verification of box numbers (item 4), filing steps (item 5), guidance (item 6) → Task 1 + Task 4 gates ✓

**Placeholder scan:** Domain/config tasks (1–4) carry full code; UI tasks (5–9) carry representative full code or explicit per-element behaviour plus runnable tests. No "TBD"/"handle edge cases".

**Type consistency:** `FilingFigures`, `CategoryTotal`, `Nudge`/`NudgeId`, `Sa103Box`, `GuidanceTopic` names/fields are consistent across tasks. `figuresFor`, `computeNudges`, `getBox`, `getRates` signatures match their consumers. `Settings.spouseIsBasicRateTaxpayer` added in Task 3 is consumed by `computeNudges` in the same task.

**Verification gates:** Tasks 1 and 4 must not be marked done until their HMRC/GOV.UK checks pass — the reviewer will re-verify (as with Plan 1's rate config).

**Deferred to later:** Plan 3 (bank-statement import) remains separate.
