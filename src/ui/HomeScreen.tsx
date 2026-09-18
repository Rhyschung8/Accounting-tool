// src/ui/HomeScreen.tsx
import { useState } from 'react'
import { useStore } from '../state/useStore'
import { currentTaxYear, formatTaxYear } from '../domain/taxYear'
import { toCsv } from '../domain/csvExport'
import { strings } from '../i18n/strings'
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

interface NavItem {
  view: ActiveView
  ico: string
  ko: string
  en: string
}

const NAV_ITEMS: NavItem[] = [
  { view: 'home',       ico: '🏠', ko: '홈',         en: 'Home' },
  { view: 'entries',    ico: '📋', ko: '전체 내역',  en: 'All entries' },
  { view: 'yearEnd',    ico: '📅', ko: '연말 정산',  en: 'Year-end & filing' },
  { view: 'goodToKnow', ico: '📖', ko: '알아두기',   en: 'Good to know' },
]

const FOOT_ITEMS: NavItem[] = [
  { view: 'deleted',  ico: '🗑️', ko: '최근 삭제', en: 'Recently deleted' },
  { view: 'settings', ico: '⚙️', ko: '설정',      en: 'Settings' },
]

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

  function SidebarButton({ item }: { item: NavItem }) {
    const isActive = activeView === item.view
    return (
      <button
        className={`sidebar__item${isActive ? ' is-active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => setActiveView(item.view)}
      >
        <span className="sidebar__ico">{item.ico}</span>
        <span>
          <span className="lang-ko">{item.ko}</span>
          <span className="lang-en">{item.en}</span>
        </span>
      </button>
    )
  }

  function renderMainContent() {
    switch (activeView) {
      case 'entries':
        return <EntryList taxYear={taxYear} />
      case 'deleted':
        return <RecentlyDeleted />
      case 'settings':
        return <Settings />
      case 'yearEnd':
        return <YearEndScreen />
      case 'goodToKnow':
        return <GoodToKnow />
      default:
        return renderHome()
    }
  }

  function renderHome() {
    return (
      <>
        <header className="page-head">
          <div>
            <h1>올해 요약 / Your year so far</h1>
            <p className="page-head__sub">세금 연도 {taxYear} · {formatTaxYear(taxYear)}</p>
          </div>
          <div className="page-head__actions">
            <select
              aria-label="Tax year"
              value={taxYear}
              onChange={e => setTaxYear(e.target.value)}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{formatTaxYear(y)}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={handleExportCsv}>
              CSV 내보내기 / Export
            </button>
          </div>
        </header>

        <SummaryPanel taxYear={taxYear} />

        <NudgesPanel taxYear={currentTaxYear()} />

        <h2 className="section-title">
          무엇을 할까요? <span className="lang-en">What would you like to do?</span>
        </h2>

        <div className="action-buttons">
          <BigButton
            icon="💷"
            labelKo={strings.gotPaid.ko}
            labelEn={strings.gotPaid.en}
            onClick={() => setActiveForm('gotPaid')}
          />
          <BigButton
            icon="🛒"
            labelKo={strings.boughtSomething.ko}
            labelEn={strings.boughtSomething.en}
            onClick={() => setActiveForm('boughtSomething')}
          />
          <BigButton
            icon="🚗"
            labelKo={strings.drove.ko}
            labelEn={strings.drove.en}
            onClick={() => setActiveForm('drove')}
          />
          <BigButton
            icon="🏠"
            labelKo={strings.workedFromHome.ko}
            labelEn={strings.workedFromHome.en}
            onClick={() => setActiveForm('workedFromHome')}
          />
        </div>

        {/* M4: empty-state welcome hint */}
        {state.entries.filter(e => !e.deletedAt).length === 0 && (
          <div className="welcome-hint">
            <span className="lang-ko">아직 기록이 없어요. 아래에서 시작해 보세요</span>
            <span className="lang-en">No records yet — tap a button below to start.</span>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span>🎹</span>
          <span>피아노 회계</span>
        </div>
        <span className="sidebar__label">메뉴 / Menu</span>
        {NAV_ITEMS.map(item => (
          <SidebarButton key={item.view} item={item} />
        ))}
        <div className="sidebar__foot">
          {FOOT_ITEMS.map(item => (
            <SidebarButton key={item.view} item={item} />
          ))}
        </div>
      </aside>

      <main className="main">
        {renderMainContent()}
      </main>

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
