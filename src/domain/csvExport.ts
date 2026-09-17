import type { Entry } from './entry'
import { taxYearOf } from './taxYear'

function esc(field: string): string {
  return /[",\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field
}

export function toCsv(entries: Entry[], taxYear: string): string {
  const header = 'Date,Type,Description,Category,Amount,Claimable,Receipt'
  const rows = entries
    .filter(e => !e.deletedAt && taxYearOf(e.date) === taxYear)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => [
      e.date,
      e.type,
      esc(e.description),
      e.category,
      (e.amountPence / 100).toFixed(2),
      e.claimable ? 'yes' : 'no',
      e.receiptFile ?? '',
    ].join(','))
  return [header, ...rows].join('\n') + '\n'
}
