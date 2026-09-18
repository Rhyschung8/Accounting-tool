// src/ui/Settings.tsx
import { useState } from 'react'
import { useStore } from '../state/useStore'
import { parsePence } from '../domain/money'
import { TAX_YEARS } from '../config/taxYears'
import { loadDirHandle } from '../storage/handleStore'
import { writeBackup } from '../storage/backup'
import type { Settings as SettingsType } from '../storage/storage'

const TEXT_SIZE_OPTIONS: { value: SettingsType['textSize']; label: string }[] = [
  { value: 'normal', label: '보통 / Normal' },
  { value: 'large', label: '크게 / Large' },
  { value: 'xlarge', label: '아주 크게 / Very large' },
]

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
  const [backupDone, setBackupDone] = useState(false)

  async function handleSaveHours() {
    const h = Number(hours)
    if (h > 0 && !isNaN(h)) {
      await setSettings({ hoursPerWeekAtHome: h })
      // I2: regenerate home-office for every configured tax year (spec §12), not just the current one.
      for (const ty of Object.keys(TAX_YEARS)) {
        await regenerateHomeOffice(ty)
      }
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

  async function handleBackup() {
    // I4: guard keeps jsdom (tests) safe — the button is disabled when the API is missing.
    if (typeof window.showDirectoryPicker !== 'function') return
    const handle = await loadDirHandle()
    if (!handle) return
    const currentAppData = {
      entries: state.entries,
      settings: state.settings,
      learnedMerchants: state.learnedMerchants,
    }
    await writeBackup(handle, JSON.stringify(currentAppData))
    setBackupDone(true)
  }

  return (
    <div>
      <h2>설정 / Settings</h2>

      {/* Text size */}
      <section>
        <fieldset>
          <legend>글자 크기 / Text size</legend>
          {TEXT_SIZE_OPTIONS.map(({ value, label }) => (
            <label key={value}>
              <input
                type="radio"
                name="textSize"
                value={value}
                checked={textSize === value}
                onChange={() => handleTextSizeChange(value)}
              />
              {label}
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

      {/* Spouse basic-rate taxpayer */}
      <section>
        <label>
          <input
            type="checkbox"
            aria-label="배우자가 기본세율 납세자인가요? / Is your spouse a basic-rate taxpayer?"
            checked={state.settings.spouseIsBasicRateTaxpayer}
            onChange={e => setSettings({ spouseIsBasicRateTaxpayer: e.target.checked })}
          />
          배우자가 기본세율 납세자인가요? / Is your spouse a basic-rate taxpayer?
        </label>
      </section>

      {/* Backup */}
      <section>
        <button
          onClick={handleBackup}
          disabled={typeof window.showDirectoryPicker !== 'function'}
        >
          내 기록 백업 / Back up my records
        </button>
        {backupDone && <p role="status">백업했어요 / Backed up</p>}
      </section>
    </div>
  )
}
