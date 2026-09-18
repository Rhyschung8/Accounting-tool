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
