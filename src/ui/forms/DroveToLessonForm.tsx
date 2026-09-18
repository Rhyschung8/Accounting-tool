// src/ui/forms/DroveToLessonForm.tsx
import { useMemo, useState } from 'react'
import { useStore } from '../../state/useStore'
import { mileagePence } from '../../domain/mileage'
import { getRates } from '../../config/taxYears'
import { currentTaxYear, taxYearOf } from '../../domain/taxYear'
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

  // I3: miles already driven in the current tax year so the 10k split is cumulative.
  const milesAlreadyThisYear = useMemo(() => {
    return state.entries
      .filter(e => e.type === 'journey' && !e.deletedAt && taxYearOf(e.date) === currentTaxYear())
      .reduce((sum, e) => sum + (((e.details ?? {}) as { miles?: number }).miles ?? 0), 0)
  }, [state.entries])

  const milesNum = Number(miles) || 0
  const pence = mileagePence(milesNum, rates, milesAlreadyThisYear)

  async function add(dest: string, m: number) {
    await addEntry({
      date: new Date().toISOString().slice(0, 10),
      type: 'journey',
      amountPence: mileagePence(m, rates, milesAlreadyThisYear),
      description: `Drove to ${dest} / ${dest} 레슨`,
      category: 'travel',
      details: { destination: dest, miles: m, ratePence: rates.mileageHigherPencePerMile },
    })
    onDone()
  }

  return (
    <div>
      {saved.map(([dest, m]) => (
        <button key={dest} onClick={() => add(dest, m)}>
          {dest} — {m} miles
        </button>
      ))}
      {!isNew && (
        <button onClick={() => setIsNew(true)}>새 장소 / Somewhere new</button>
      )}
      {isNew && (
        <div>
          <label>
            어디로 / Where to
            <input
              aria-label="destination"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="e.g. Richmond"
            />
          </label>
          <label>
            거리 / Miles
            <input
              aria-label="miles"
              value={miles}
              onChange={e => setMiles(e.target.value)}
              placeholder="e.g. 6"
            />
          </label>
          {milesNum > 0 && (
            <p>
              We worked this out for you: <MoneyDisplay pence={pence} />
            </p>
          )}
          <button onClick={() => add(destination, milesNum)}>저장 / Save</button>
        </div>
      )}
    </div>
  )
}
