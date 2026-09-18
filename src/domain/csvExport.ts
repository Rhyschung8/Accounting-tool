import type { Entry } from './entry'
import { taxYearOf } from './taxYear'
import { getBox } from '../config/sa103sBoxes'

function esc(field: string): string {
  return /[",\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field
}

function boxForEntry(entry: Entry): string {
  if (entry.type === 'income') return getBox('turnover').number
  if (entry.claimable) return getBox('expenses').number
  return ''
}

export function toCsv(entries: Entry[], taxYear: string): string {
  const header = 'Date,Type,Description,Category,Amount,Claimable,Receipt,HMRC box'
  const rows = entries
    .filter(e => !e.deletedAt && taxYearOf(e.date) === taxYear)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => [
      e.date,
      e.type,
      esc(e.description),
      esc(e.category),
      (e.amountPence / 100).toFixed(2),
      e.claimable ? 'yes' : 'no',
      esc(e.receiptFile ?? ''),
      boxForEntry(e),
    ].join(','))
  return [header, ...rows].join('\n') + '\n'
}
