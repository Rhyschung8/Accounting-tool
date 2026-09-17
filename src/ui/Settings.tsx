// src/ui/Settings.tsx
import { useState } from 'react'
import { useStore } from '../state/useStore'
import { parsePence } from '../domain/money'
import { currentTaxYear } from '../domain/taxYear'
import type { Settings as SettingsType } from '../storage/storage'

export function Settings() {
  const { state, setSettings, regenerateHomeOffice } = useStore()

  const [hours, setHours] = useState(String(state.settings.hoursPerWeekAtHome))
  const [otherIncome, setOtherIncome] = useState(
    state.settings.otherIncomePence > 0
      ? String(state.settings.otherIncomePence / 100)
      : '',
  )
  const [threshold, setThreshold] = useState(
    String(state.settings.largePurchaseThresholdPence / 100),
  )
  const [textSize, setTextSize] = useState<SettingsType['textSize']>(
    state.settings.textSize,
  )

  async function handleSaveHours() {
    const h = Number(hours)
    if (h > 0 && !isNaN(h)) {
      await setSettings({ hoursPerWeekAtHome: h })
      await regenerateHomeOffice(currentTaxYear())
    }
  }

  async function handleSaveOtherIncome() {
    const pence = parsePence(otherIncome)
    if (pence !== null) {
      await setSettings({ otherIncomePence: pence })
    }
  }

  async function handleSaveThreshold() {
    const pence = parsePence(threshold)
    if (pence !== null) {
      await setSettings({ largePurchaseThresholdPence: pence })
    }
  }

  async function handleTextSizeChange(size: SettingsType['textSize']) {
    setTextSize(size)
    document.documentElement.dataset.textSize = size
    await setSettings({ textSize: size })
  }

  function handleBackup() {
    if (typeof window.showDirectoryPicker === 'undefined') {
      // File System Access API not available (e.g. jsdom in tests)
      return
    }
    // In a real browser, trigger backup flow via pickFolder
    // This is intentionally a no-op stub here; full backup uses fileSystemStorage
  }

  return (
    <div>
      <h2>설정 / Settings</h2>

      {/* Text size */}
      <section>
        <fieldset>
          <legend>글자 크기 / Text size</legend>
          {(['normal', 'large', 'xlarge'] as const).map(size => (
            <label key={size}>
              <input
                type="radio"
                name="textSize"
                value={size}
                checked={textSize === size}
                onChange={() => handleTextSizeChange(size)}
              />
              {size}
            </label>
          ))}
        </fieldset>
      </section>

      {/* Hours per week at home */}
      <section>
        <label>
          주당 재택근무 시간 / Hours per week working from home
          <input
            aria-label="hours per week at home"
            type="number"
            min={0}
            value={hours}
            onChange={e => setHours(e.target.value)}
          />
        </label>
        <button onClick={handleSaveHours}>시간 저장 / Save hours</button>
      </section>

      {/* Other income */}
      <section>
        <label>
          기타 수입 / Other income (£)
          <input
            aria-label="other income"
            type="text"
            value={otherIncome}
            onChange={e => setOtherIncome(e.target.value)}
          />
        </label>
        <button onClick={handleSaveOtherIncome}>저장 / Save other income</button>
      </section>

      {/* Large purchase threshold */}
      <section>
        <label>
          큰 구매 기준 / Large-purchase threshold (£)
          <input
            aria-label="large purchase threshold"
            type="text"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
          />
        </label>
        <button onClick={handleSaveThreshold}>저장 / Save threshold</button>
      </section>

      {/* Backup */}
      <section>
        <button
          onClick={handleBackup}
          disabled={typeof window.showDirectoryPicker === 'undefined'}
        >
          내 기록 백업 / Back up my records
        </button>
      </section>
    </div>
  )
}
