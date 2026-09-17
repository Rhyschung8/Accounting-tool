// src/ui/forms/WorkedFromHomeForm.tsx
import { useState } from 'react'
import { useStore } from '../../state/useStore'
import { currentTaxYear } from '../../domain/taxYear'

export function WorkedFromHomeForm({ onDone }: { onDone: () => void }) {
  const { state, setSettings, regenerateHomeOffice } = useStore()
  const [hours, setHours] = useState(String(state.settings.hoursPerWeekAtHome))

  async function handleSave() {
    const h = Number(hours)
    await setSettings({ hoursPerWeekAtHome: h })
    await regenerateHomeOffice(currentTaxYear())
    onDone()
  }

  return (
    <div>
      <label>
        Hours per week working from home / 주당 재택근무 시간
        <input
          aria-label="hours per week"
          type="number"
          min={0}
          value={hours}
          onChange={e => setHours(e.target.value)}
        />
      </label>
      <button onClick={handleSave}>Save / 저장</button>
    </div>
  )
}
