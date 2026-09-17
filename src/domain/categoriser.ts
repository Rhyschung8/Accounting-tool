import { CATEGORIES } from '../config/categories'
import { FUEL_KEYWORDS } from '../config/fuel'

export interface CategoriseResult {
  category: string
  claimable: boolean
  note?: 'fuel_excluded'
}

export function categorise(
  description: string,
  learnedMerchants: Record<string, string>,
): CategoriseResult {
  const text = description.toLowerCase()

  for (const merchant of Object.keys(learnedMerchants)) {
    if (text.includes(merchant.toLowerCase())) {
      return { category: learnedMerchants[merchant], claimable: true }
    }
  }

  if (FUEL_KEYWORDS.some(k => text.includes(k))) {
    return { category: 'travel', claimable: false, note: 'fuel_excluded' }
  }

  for (const cat of CATEGORIES) {
    const hit = [...cat.keywordsEn, ...cat.keywordsKo].some(k => text.includes(k.toLowerCase()))
    if (hit) return { category: cat.key, claimable: true }
  }

  return { category: 'uncategorised', claimable: true }
}
