// src/ui/SummaryPanel.tsx
import { useStore } from '../state/useStore'
import { summarise } from '../domain/summary'
import { MoneyDisplay } from './components/MoneyDisplay'
import { strings } from '../i18n/strings'
import { IconMoneyIn, IconMoneyOut, IconWhatsLeft } from './components/icons'

export function SummaryPanel({ taxYear }: { taxYear: string }) {
  const { state } = useStore()
  const s = summarise(state.entries, taxYear, state.settings.otherIncomePence)

  return (
    <>
      <div className="stat-cards">
        {/* Money in */}
        <div className="stat-card">
          <div className="stat-card__top">
            <span>
              <span className="lang-ko">{strings.moneyIn.ko}</span>
              <span className="lang-en">{strings.moneyIn.en}</span>
            </span>
            <span className="stat-card__chip"><IconMoneyIn size={22} /></span>
          </div>
          <div className="stat-card__num">
            <MoneyDisplay pence={s.incomePence} />
          </div>
        </div>

        {/* Money out */}
        <div className="stat-card">
          <div className="stat-card__top">
            <span>
              <span className="lang-ko">{strings.moneyOut.ko}</span>
              <span className="lang-en">{strings.moneyOut.en}</span>
            </span>
            <span className="stat-card__chip"><IconMoneyOut size={22} /></span>
          </div>
          <div className="stat-card__num">
            <MoneyDisplay pence={s.expensesPence} />
          </div>
        </div>

        {/* What's left — hero card */}
        <div className="stat-card stat-card--hero">
          <div className="stat-card__top">
            <span>
              <span className="lang-ko">{strings.whatsLeft.ko}</span>
              <span className="lang-en">{strings.whatsLeft.en}</span>
            </span>
            <span className="stat-card__chip"><IconWhatsLeft size={22} /></span>
          </div>
          <div className="stat-card__num">
            {s.estimate.isLoss ? (
              <span className="summary__loss">
                이번 해는 지출이 수입보다 많았어요. / This year your costs were higher than your income — that&apos;s okay.
              </span>
            ) : (
              <MoneyDisplay pence={s.profitPence} />
            )}
          </div>
        </div>
      </div>

      {/* Tax estimate line */}
      <div className="tax-line">
        <div>
          <span>
            <span className="lang-ko" style={{ fontWeight: 600 }}>{strings.estimatedTax.ko}</span>
            {' '}
            <span className="lang-en" style={{ color: 'var(--colour-muted)', display: 'inline' }}>{strings.estimatedTax.en}</span>
          </span>
          <p className="tax-line__caveat">{strings.estimateCaveat.ko} / {strings.estimateCaveat.en}</p>
        </div>
        <MoneyDisplay pence={s.estimate.totalPence} />
      </div>
    </>
  )
}
