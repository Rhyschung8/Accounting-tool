// src/ui/forms/GotPaidForm.tsx
import { useMemo, useState } from 'react'
import { useStore } from '../../state/useStore'
import { parsePence } from '../../domain/money'
import { MoneyDisplay } from '../components/MoneyDisplay'

export function GotPaidForm({ onDone }: { onDone: () => void }) {
  const { state, addEntry } = useStore()
  const [isNew, setIsNew] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [amountError, setAmountError] = useState('')
  const [busy, setBusy] = useState(false)

  // Derive repeat-payer list: deduped by description, most recent amount
  const payers = useMemo(() => {
    const seen = new Map<string, number>()
    // Iterate newest-first so first seen = most recent
    const income = [...state.entries]
      .filter(e => e.type === 'income' && !e.deletedAt)
      .sort((a, b) => b.date.localeCompare(a.date))
    for (const e of income) {
      if (!seen.has(e.description)) seen.set(e.description, e.amountPence)
    }
    return [...seen.entries()]
  }, [state.entries])

  async function addRepeat(description: string, amountPence: number) {
    if (busy) return
    setBusy(true)
    await addEntry({
      date: new Date().toISOString().slice(0, 10),
      type: 'income',
      amountPence,
      description,
      category: 'income',
    })
    onDone()
  }

  async function handleSave() {
    if (busy) return
    const pence = parsePence(amount)
    if (pence === null) {
      setAmountError('금액을 입력해 주세요 / Please enter a valid amount')
      return
    }
    setAmountError('')
    setBusy(true)
    await addEntry({
      date,
      type: 'income',
      amountPence: pence,
      description: name,
      category: 'income',
    })
    onDone()
  }

  return (
    <div>
      {payers.map(([desc, pence]) => (
        <button key={desc} className="payer-chip" disabled={busy} onClick={() => addRepeat(desc, pence)}>
          {desc} — <MoneyDisplay pence={pence} />
        </button>
      ))}
      {!isNew && (
        <button className="btn-secondary" onClick={() => setIsNew(true)}>새 분 / Someone new</button>
      )}
      {isNew && (
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
              placeholder="e.g. 30"
            />
          </label>
          {amountError && <p role="alert" className="form-error">{amountError}</p>}
          <label>
            이름 / Name
            <input
              aria-label="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Emma"
            />
          </label>
          <button className="btn-primary" disabled={busy} onClick={handleSave}>저장 / Save</button>
        </div>
      )}
    </div>
  )
}
