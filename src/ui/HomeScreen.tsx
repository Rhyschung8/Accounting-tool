// src/ui/HomeScreen.tsx
import { useState } from 'react'
import { useStore } from '../state/useStore'
import { currentTaxYear, formatTaxYear } from '../domain/taxYear'
import { toCsv } from '../domain/csvExport'
import { bilingual, strings } from '../i18n/strings'
import { TAX_YEARS } from '../config/taxYears'
import { BigButton } from './components/BigButton'
import { SummaryPanel } from './SummaryPanel'
import { EntryList } from './EntryList'
import { RecentlyDeleted } from './RecentlyDeleted'
import { Settings } from './Settings'
import { GotPaidForm } from './forms/GotPaidForm'
import { BoughtSomethingForm } from './forms/BoughtSomethingForm'
import { DroveToLessonForm } from './forms/DroveToLessonForm'
import { WorkedFromHomeForm } from './forms/WorkedFromHomeForm'
import { NudgesPanel } from './NudgesPanel'
import { YearEndScreen } from './YearEndScreen'
import { GoodToKnow } from './GoodToKnow'

type ActiveForm = 'gotPaid' | 'boughtSomething' | 'drove' | 'workedFromHome' | null
type ActiveView = 'home' | 'entries' | 'deleted' | 'settings' | 'yearEnd' | 'goodToKnow'

export function HomeScreen() {
  const { state } = useStore()
  const [taxYear, setTaxYear] = useState<string>(currentTaxYear)
  const [activeForm, setActiveForm] = useState<ActiveForm>(null)
  const [activeView, setActiveView] = useState<ActiveView>('home')

  const availableYears = Object.keys(TAX_YEARS).sort().reverse()

  function handleExportCsv() {
    const csv = toCsv(state.entries, taxYear)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `piano-accounts-${taxYear.replace('/', '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function closeForm() {
    setActiveForm(null)
  }

  if (activeView === 'entries') {
    return (
      <div className="app-shell">
        <button className="back-link" onClick={() => setActiveView('home')}>
          ← {bilingual('seeEverything')}
        </button>
        <EntryList taxYear={taxYear} />
      </div>
    )
  }

  if (activeView === 'deleted') {
    return (
      <div className="app-shell">
        <button className="back-link" onClick={() => setActiveView('home')}>
          ← {bilingual('recentlyDeleted')}
        </button>
        <RecentlyDeleted />
      </div>
    )
  }

  if (activeView === 'settings') {
    return (
      <div className="app-shell">
        <button className="back-link" onClick={() => setActiveView('home')}>
          ← {bilingual('settings')}
        </button>
        <Settings />
      </div>
    )
  }

  if (activeView === 'yearEnd') {
    return (
      <div className="app-shell">
        <button className="back-link" onClick={() => setActiveView('home')}>
          ← 연말 정산 / Year-end &amp; filing
        </button>
        <YearEndScreen />
      </div>
    )
  }

  if (activeView === 'goodToKnow') {
    return (
      <div className="app-shell">
        <button className="back-link" onClick={() => setActiveView('home')}>
          ← 알아두기 / Good to know
        </button>
        <GoodToKnow />
      </div>
    )
  }

  return (
    <div className="app-shell">
      {/* Tax-year selector */}
      <div className="year-selector">
        <label htmlFor="tax-year-select">세금 연도 / Tax year</label>
        <select
          id="tax-year-select"
          aria-label="Tax year"
          value={taxYear}
          onChange={e => setTaxYear(e.target.value)}
        >
          {availableYears.map(y => (
            <option key={y} value={y}>{formatTaxYear(y)}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <SummaryPanel taxYear={taxYear} />

      {/* Contextual nudges */}
      <NudgesPanel taxYear={currentTaxYear()} />

      {/* Four action BigButtons */}
      <div className="action-buttons">
        <BigButton
          icon="💷"
          label={`${strings.gotPaid.ko} / ${strings.gotPaid.en}`}
          onClick={() => setActiveForm('gotPaid')}
        />
        <BigButton
          icon="🛒"
          label={`${strings.boughtSomething.ko} / ${strings.boughtSomething.en}`}
          onClick={() => setActiveForm('boughtSomething')}
        />
        <BigButton
          icon="🚗"
          label={`${strings.drove.ko} / ${strings.drove.en}`}
          onClick={() => setActiveForm('drove')}
        />
        <BigButton
          icon="🏠"
          label={`${strings.workedFromHome.ko} / ${strings.workedFromHome.en}`}
          onClick={() => setActiveForm('workedFromHome')}
        />
      </div>

      {/* Secondary nav */}
      <nav className="secondary-nav">
        <button className="secondary-link" onClick={() => setActiveView('entries')}>
          {bilingual('seeEverything')}
        </button>
        <button className="secondary-link" onClick={() => setActiveView('deleted')}>
          {bilingual('recentlyDeleted')}
        </button>
        <button className="secondary-link" onClick={() => setActiveView('settings')}>
          {bilingual('settings')}
        </button>
        <button className="secondary-link" onClick={() => setActiveView('yearEnd')}>
          연말 정산 / Year-end &amp; filing
        </button>
        <button className="secondary-link" onClick={() => setActiveView('goodToKnow')}>
          알아두기 / Good to know
        </button>
      </nav>

      {/* CSV export */}
      <button className="csv-export-btn" onClick={handleExportCsv}>
        CSV 내보내기 / Export CSV
      </button>

      {/* Modal for active form */}
      {activeForm !== null && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <button className="modal-close" onClick={closeForm} aria-label="닫기 / Close">✕</button>
            {activeForm === 'gotPaid' && <GotPaidForm onDone={closeForm} />}
            {activeForm === 'boughtSomething' && <BoughtSomethingForm onDone={closeForm} />}
            {activeForm === 'drove' && <DroveToLessonForm onDone={closeForm} />}
            {activeForm === 'workedFromHome' && <WorkedFromHomeForm onDone={closeForm} />}
          </div>
        </div>
      )}
    </div>
  )
}
