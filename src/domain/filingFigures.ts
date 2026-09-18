import type { Entry } from './entry'
import { taxYearOf } from './taxYear'

export interface CategoryTotal { key: string; amountPence: number }
export interface FilingFigures {
  taxYear: string
  turnoverPence: number
  expensesPence: number
  netPence: number
  isLoss: boolean
  byCategory: CategoryTotal[]
}

export function figuresFor(entries: Entry[], taxYear: string): FilingFigures {
  const live = entries.filter(e => !e.deletedAt && e.claimable && taxYearOf(e.date) === taxYear)
  let turnoverPence = 0
  let expensesPence = 0
  const cat = new Map<string, number>()
  for (const e of live) {
    if (e.type === 'income') {
      turnoverPence += e.amountPence
    } else {
      expensesPence += e.amountPence
      cat.set(e.category, (cat.get(e.category) ?? 0) + e.amountPence)
    }
  }
  const netPence = turnoverPence - expensesPence
  const byCategory = [...cat.entries()]
    .map(([key, amountPence]) => ({ key, amountPence }))
    .sort((a, b) => b.amountPence - a.amountPence)
  return { taxYear, turnoverPence, expensesPence, netPence, isLoss: netPence < 0, byCategory }
}
