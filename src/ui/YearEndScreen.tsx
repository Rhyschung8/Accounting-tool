// src/ui/YearEndScreen.tsx
import { useState } from 'react'
import { useStore } from '../state/useStore'
import { currentTaxYear, formatTaxYear } from '../domain/taxYear'
import { figuresFor } from '../domain/filingFigures'
import { TAX_YEARS } from '../config/taxYears'
import { MoneyDisplay } from './components/MoneyDisplay'
import { NudgesPanel } from './NudgesPanel'
import { BeforeYouFile } from './BeforeYouFile'
import { FilingWalkthrough } from './FilingWalkthrough'

export function YearEndScreen() {
  const { state } = useStore()
  const [selectedYear, setSelectedYear] = useState<string>(currentTaxYear())

  const availableYears = Object.keys(TAX_YEARS).sort().reverse()
  const figures = figuresFor(state.entries, selectedYear)

  return (
    <div className="year-end-screen">
      <h1>연말 정산 / Year-end &amp; filing</h1>

      {/* Tax-year selector */}
      <div className="year-selector">
        <label htmlFor="year-end-year-select">세금 연도 / Tax year</label>
        <select
          id="year-end-year-select"
          aria-label="Tax year"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
        >
          {availableYears.map(y => (
            <option key={y} value={y}>{formatTaxYear(y)}</option>
          ))}
        </select>
      </div>

      {/* Summary line */}
      <section className="year-end-summary">
        <h2>요약 / Summary — {selectedYear}</h2>
        <dl className="year-end-summary__figures">
          <div>
            <dt>총수입 / Turnover</dt>
            <dd><MoneyDisplay pence={figures.turnoverPence} /></dd>
          </div>
          <div>
            <dt>비용 / Expenses</dt>
            <dd><MoneyDisplay pence={figures.expensesPence} /></dd>
          </div>
          <div>
            <dt>{figures.isLoss ? '손실 / Loss' : '순이익 / Net profit'}</dt>
            <dd><MoneyDisplay pence={Math.abs(figures.netPence)} /></dd>
          </div>
        </dl>
        {figures.isLoss && (
          <p className="year-end-summary__loss-note">
            이번 연도는 손실이 발생했어요. 걱정하지 마세요 — 보통 다음 해 이익에서 공제할 수 있어요.
            / This year shows a loss. Don't worry — it can usually be carried forward against next year's profit.
          </p>
        )}
      </section>

      {/* Contextual nudges */}
      <NudgesPanel taxYear={selectedYear} />

      {/* Before-you-file checklist */}
      <BeforeYouFile taxYear={selectedYear} />

      {/* Filing walkthrough */}
      <FilingWalkthrough figures={figures} />

      {/* Not-advice disclaimer */}
      <p className="disclaimer">
        일반 정보이며 세무 자문이 아닙니다 / General information, not personal tax advice.
      </p>
    </div>
  )
}
