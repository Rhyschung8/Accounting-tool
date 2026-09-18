export type EntryType = 'income' | 'expense' | 'journey' | 'home_office'

export interface Entry {
  id: string
  date: string
  type: EntryType
  amountPence: number
  description: string
  category: string
  source: 'manual' | 'import' | 'auto'
  importBatchId?: string | null
  receiptFile?: string | null
  claimable: boolean
  deletedAt?: string | null
  createdAt: string
  details?: Record<string, unknown>
}

export function newId(): string {
  return (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
}

export function makeEntry(
  partial: Omit<Entry, 'id' | 'createdAt' | 'claimable' | 'deletedAt' | 'source'> &
    Partial<Pick<Entry, 'claimable' | 'deletedAt' | 'source' | 'importBatchId' | 'receiptFile' | 'details'>>,
): Entry {
  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    claimable: partial.claimable ?? true,
    deletedAt: partial.deletedAt ?? null,
    source: partial.source ?? 'manual',
    ...partial,
  }
}
