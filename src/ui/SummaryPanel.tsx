// src/ui/SummaryPanel.tsx
import { useStore } from '../state/useStore'
import { summarise } from '../domain/summary'
import { MoneyDisplay } from './components/MoneyDisplay'
import { strings } from '../i18n/strings'

export function SummaryPanel({ taxYear }: { taxYear: string }) {
  const { state } = useStore()
  const s = summarise(state.entries, taxYear, state.settings.otherIncomePence)
  return (
    <section className="summary">
      <div>
        <span><span className="lang-ko">{strings.moneyIn.ko}</span><span className="lang-en">{strings.moneyIn.en}</span></span>
        <MoneyDisplay pence={s.incomePence} />
      </div>
      <div>
        <span><span className="lang-ko">{strings.moneyOut.ko}</span><span className="lang-en">{strings.moneyOut.en}</span></span>
        <MoneyDisplay pence={s.expensesPence} />
      </div>
      {s.estimate.isLoss ? (
        <div className="summary__loss">이번 해는 지출이 수입보다 많았어요. / This year your costs were higher than your income — that's okay.</div>
      ) : (
        <div className="summary__row summary__row--hero">
          <span><span className="lang-ko">{strings.whatsLeft.ko}</span><span className="lang-en">{strings.whatsLeft.en}</span></span>
          <MoneyDisplay pence={s.profitPence} />
        </div>
      )}
      <div className="summary__tax">
        <span><span className="lang-ko">{strings.estimatedTax.ko}</span><span className="lang-en">{strings.estimatedTax.en}</span></span>
        <MoneyDisplay pence={s.estimate.totalPence} />
      </div>
      <p className="summary__caveat">{strings.estimateCaveat.ko} / {strings.estimateCaveat.en}</p>
    </section>
  )
}
