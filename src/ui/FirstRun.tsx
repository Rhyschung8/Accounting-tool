// src/ui/FirstRun.tsx
import { useState } from 'react'
import { useStore } from '../state/useStore'
import { parsePence } from '../domain/money'
import { currentTaxYear } from '../domain/taxYear'
import { pickFolder } from '../storage/fileSystemStorage'

type Screen = 'folder' | 'homeHours' | 'otherIncome'

export function FirstRun({
  onComplete,
  onFolderPicked,
}: {
  onComplete: () => void
  /** Optional — called with the chosen handle so main.tsx can save it to IDB and swap the adapter */
  onFolderPicked?: (handle: FileSystemDirectoryHandle) => void
}) {
  const { setSettings, regenerateHomeOffice } = useStore()
  const [screen, setScreen] = useState<Screen>('folder')
  const [hours, setHours] = useState('')
  const [otherIncome, setOtherIncome] = useState('')

  async function handleFolderPick() {
    try {
      const handle = await pickFolder()
      await setSettings({ folderChosen: true })
      onFolderPicked?.(handle)
    } catch {
      // User dismissed the picker — still allow continuing
    }
    setScreen('homeHours')
  }

  function handleSkipFolder() {
    setScreen('homeHours')
  }

  async function handleSaveHours() {
    const h = Number(hours)
    if (h > 0) {
      await setSettings({ hoursPerWeekAtHome: h })
      await regenerateHomeOffice(currentTaxYear())
    }
    setScreen('otherIncome')
  }

  function handleSkipHours() {
    setScreen('otherIncome')
  }

  async function handleComplete() {
    const pence = parsePence(otherIncome)
    if (pence !== null) {
      await setSettings({ otherIncomePence: pence })
    }
    await setSettings({ folderChosen: true })
    onComplete()
  }

  function handleSkipOtherIncome() {
    setSettings({ folderChosen: true })
    onComplete()
  }

  if (screen === 'folder') {
    return (
      <div>
        <h2>시작하기 / Getting started</h2>
        <p>
          저장 폴더 선택 / Choose a folder where your records will be saved
        </p>
        <button onClick={handleFolderPick}>폴더 선택 / Pick a folder</button>
        <button onClick={handleSkipFolder}>건너뛰기 / Skip</button>
      </div>
    )
  }

  if (screen === 'homeHours') {
    return (
      <div>
        <h2>재택근무 / Working from home</h2>
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
        <button onClick={handleSaveHours}>다음 / Next</button>
        <button onClick={handleSkipHours}>건너뛰기 / Skip</button>
      </div>
    )
  }

  // screen === 'otherIncome'
  return (
    <div>
      <h2>기타 수입 / Other income</h2>
      <p>
        피아노 교습 외 다른 수입이 있으신가요? / Do you have income from sources other than piano teaching?
      </p>
      <label>
        기타 수입 (£) / Other income (£)
        <input
          aria-label="other income"
          type="text"
          value={otherIncome}
          onChange={e => setOtherIncome(e.target.value)}
        />
      </label>
      <button onClick={handleComplete}>완료 / Done</button>
      <button onClick={handleSkipOtherIncome}>건너뛰기 / Skip</button>
    </div>
  )
}
