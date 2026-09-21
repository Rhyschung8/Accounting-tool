// src/ui/EntryList.tsx
import { useState } from 'react'
import { useStore } from '../state/useStore'
import { taxYearOf } from '../domain/taxYear'
import { CATEGORIES } from '../config/categories'
import { MoneyDisplay } from './components/MoneyDisplay'
import { IconReceipt } from './components/icons'
import { PageHelp } from './components/PageHelp'
import { PAGE_HELP } from '../config/pageHelp'
import { EditEntry } from './EditEntry'
import type { Entry } from '../domain/entry'

function getCategoryLabel(key: string): string {
  if (key === 'income') return '수입 / Income'
  const cat = CATEGORIES.find(c => c.key === key)
  return cat ? `${cat.labelKo} / ${cat.labelEn}` : key
}

function groupByMonth(entries: Entry[]): Map<string, Entry[]> {
  const map = new Map<string, Entry[]>()
  for (const e of entries) {
    const month = e.date.slice(0, 7)
    if (!map.has(month)) map.set(month, [])
    map.get(month)!.push(e)
  }
  return map
}

export function EntryList({ taxYear }: { taxYear: string }) {
  const { state } = useStore()
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const entries = state.entries
    .filter(e => !e.deletedAt && taxYearOf(e.date) === taxYear)
    .sort((a, b) => b.date.localeCompare(a.date))

  const grouped = groupByMonth(entries)
  const sortedMonths = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))

  if (editingEntry) {
    return (
      <EditEntry
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
      />
    )
  }

  return (
    <div className="entry-list">
      <PageHelp content={PAGE_HELP.entries} />
      {sortedMonths.map(month => (
        <section key={month}>
          <h3>{month}</h3>
          <ul>
            {grouped.get(month)!.map(entry => {
              const isAuto = entry.source === 'auto'
              return (
                <li key={entry.id}>
                  <button
                    className="entry-row"
                    onClick={() => setEditingEntry(entry)}
                  >
                    <span className="entry-date">{entry.date}</span>
                    <span className="entry-description">
                      {entry.description}
                      {isAuto && <span className="pill pill--muted entry-auto"> 자동 / auto</span>}
                    </span>
                    <span className="entry-category">{getCategoryLabel(entry.category)}</span>
                    <MoneyDisplay pence={entry.amountPence} />
                    {entry.claimable === false && (
                      <span className="pill pill--muted entry-not-claimed">미청구 / not claimed</span>
                    )}
                    {entry.receiptFile && <span className="pill pill--ok entry-receipt" aria-label="receipt"><IconReceipt size={16} /></span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
