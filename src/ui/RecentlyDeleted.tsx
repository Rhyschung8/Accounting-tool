// src/ui/RecentlyDeleted.tsx
import { useStore } from '../state/useStore'
import { MoneyDisplay } from './components/MoneyDisplay'

export function RecentlyDeleted() {
  const { state, restore } = useStore()

  const deleted = state.entries.filter(e => e.deletedAt)

  if (deleted.length === 0) {
    return <p>삭제된 항목 없음 / No deleted entries</p>
  }

  return (
    <div className="recently-deleted">
      <ul>
        {deleted.map(entry => (
          <li key={entry.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>{entry.date}</span>
            <span>{entry.description}</span>
            <MoneyDisplay pence={entry.amountPence} />
            <button onClick={() => restore(entry.id)}>복원 / Restore</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
