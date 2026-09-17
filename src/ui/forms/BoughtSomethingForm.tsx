// src/ui/forms/BoughtSomethingForm.tsx
import { useState, useEffect } from 'react'
import { useStore } from '../../state/useStore'
import { parsePence } from '../../domain/money'
import { categorise } from '../../domain/categoriser'
import { CATEGORIES } from '../../config/categories'

const BUSINESS_USE_OPTIONS = [
  { label: '수업 전용 / Only teaching', percent: 100 },
  { label: '대부분 수업용 / Also personal (75% teaching)', percent: 75 },
  { label: '절반 수업용 / Also personal (50% teaching)', percent: 50 },
  { label: '일부 수업용 / Also personal (25% teaching)', percent: 25 },
]

export function BoughtSomethingForm({ onDone }: { onDone: () => void }) {
  const { state, addEntry, learnMerchant } = useStore()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('uncategorised')
  const [suggestedCategory, setSuggestedCategory] = useState('uncategorised')
  const [businessPercent, setBusinessPercent] = useState(100)
  const [amountError, setAmountError] = useState('')

  const amountPence = parsePence(amount) ?? 0
  const isLarge = amountPence > state.settings.largePurchaseThresholdPence
  const showBusinessUse = isLarge && amountPence > 0

  // Re-compute category suggestion whenever description changes
  useEffect(() => {
    if (description.trim()) {
      const result = categorise(description, state.learnedMerchants)
      setSuggestedCategory(result.category)
      setCategory(result.category)
    } else {
      setSuggestedCategory('uncategorised')
      setCategory('uncategorised')
    }
  }, [description, state.learnedMerchants])

  async function handleSave() {
    const fullPence = parsePence(amount)
    if (fullPence === null) {
      setAmountError('금액을 입력해 주세요 / Please enter a valid amount')
      return
    }
    setAmountError('')

    const userOverrode = category !== suggestedCategory
    if (userOverrode && description.trim()) {
      await learnMerchant(description, category)
    }

    let finalAmountPence = fullPence
    let details: Record<string, unknown> | undefined

    if (showBusinessUse) {
      finalAmountPence = Math.round(fullPence * businessPercent / 100)
      details = {
        fullAmountPence: fullPence,
        businessSharePercent: businessPercent,
      }
    }

    await addEntry({
      date,
      type: 'expense',
      amountPence: finalAmountPence,
      description,
      category,
      details,
    })
    onDone()
  }

  return (
    <div>
      <label>
        날짜 / Date
        <input
          aria-label="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </label>
      <label>
        금액 / Amount
        <input
          aria-label="amount"
          value={amount}
          onChange={e => { setAmount(e.target.value); setAmountError('') }}
          placeholder="e.g. 12.50"
        />
      </label>
      {amountError && <p role="alert">{amountError}</p>}
      <label>
        무엇 / What
        <input
          aria-label="what"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Sheet music"
        />
      </label>
      <label>
        분류 / Category
        <select
          aria-label="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>
              {cat.labelKo} / {cat.labelEn}
            </option>
          ))}
        </select>
      </label>
      {showBusinessUse && (
        <fieldset>
          <legend>업무 사용 비율 / Business use</legend>
          {BUSINESS_USE_OPTIONS.map(opt => (
            <label key={opt.percent}>
              <input
                type="radio"
                name="businessUse"
                value={opt.percent}
                checked={businessPercent === opt.percent}
                onChange={() => setBusinessPercent(opt.percent)}
              />
              {opt.label}
            </label>
          ))}
        </fieldset>
      )}
      <button onClick={handleSave}>저장 / Save</button>
    </div>
  )
}
