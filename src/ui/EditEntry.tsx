// src/ui/EditEntry.tsx
import { useState } from 'react'
import { useStore } from '../state/useStore'
import { parsePence } from '../domain/money'
import { CATEGORIES } from '../config/categories'
import type { Entry } from '../domain/entry'

export function EditEntry({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const { updateEntry, softDelete, restore } = useStore()
  const [date, setDate] = useState(entry.date)
  const [amount, setAmount] = useState((entry.amountPence / 100).toFixed(2))
  const [description, setDescription] = useState(entry.description)
  const [category, setCategory] = useState(entry.category)
  const [deleted, setDeleted] = useState(false)

  async function handleSave() {
    const pence = parsePence(amount)
    if (pence === null) return
    await updateEntry(entry.id, { date, amountPence: pence, description, category })
    onClose()
  }

  async function handleDelete() {
    await softDelete(entry.id)
    setDeleted(true)
  }

  async function handleUndo() {
    await restore(entry.id)
    setDeleted(false)
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
          onChange={e => setAmount(e.target.value)}
        />
      </label>
      <label>
        설명 / Description
        <input
          aria-label="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
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
      <button onClick={handleSave}>저장 / Save</button>
      {!deleted && (
        <button onClick={handleDelete}>삭제 / Delete</button>
      )}
      {deleted && (
        <button onClick={handleUndo}>되돌리기 / Undo</button>
      )}
      <button onClick={onClose}>닫기 / Close</button>
    </div>
  )
}
