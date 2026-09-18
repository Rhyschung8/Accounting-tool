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
          <h3>
            💡{' '}
            <span className="lang-ko">{n.titleKo}</span>
            <span className="lang-en">{n.titleEn}</span>
          </h3>
          <p>{n.bodyKo}</p>
          <p>{n.bodyEn}</p>
          <a href={n.govUkUrl} target="_blank" rel="noreferrer">자세히 / Learn more</a>
        </div>
      ))}
    </section>
  )
}
