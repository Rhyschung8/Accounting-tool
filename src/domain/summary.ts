import type { Entry } from './entry'
import { taxYearOf } from './taxYear'
import { estimate, type TaxEstimate } from './taxEngine'
import { getRates } from '../config/taxYears'

export interface Summary {
  incomePence: number
  expensesPence: number
  profitPence: number
  estimate: TaxEstimate
}

export function summarise(entries: Entry[], taxYear: string, otherIncomePence: number): Summary {
  const live = entries.filter(e => !e.deletedAt && e.claimable && taxYearOf(e.date) === taxYear)
  let incomePence = 0
  let expensesPence = 0
  for (const e of live) {
    if (e.type === 'income') incomePence += e.amountPence
    else expensesPence += e.amountPence
  }
  const profitPence = incomePence - expensesPence
  return {
    incomePence,
    expensesPence,
    profitPence,
    estimate: estimate(profitPence, otherIncomePence, getRates(taxYear)),
  }
}
