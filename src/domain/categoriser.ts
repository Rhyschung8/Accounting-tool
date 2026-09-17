import { CATEGORIES } from '../config/categories'
import { FUEL_KEYWORDS } from '../config/fuel'

export interface CategoriseResult {
  category: string
  claimable: boolean
  note?: 'fuel_excluded'
}

function matchesKeyword(text: string, keyword: string): boolean {
  const k = keyword.toLowerCase()
  if (/[㄰-㆏가-힣]/.test(k)) return text.includes(k) // Korean → substring
  // English → word-boundary match, escaping regex chars; handles multi-word phrases like "sheet music"
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
}

export function categorise(
  description: string,
  learnedMerchants: Record<string, string>,
): CategoriseResult {
  const text = description.toLowerCase()

  // N1: fuel is checked BEFORE learned merchants so a learned mapping can never
  // make a clear fuel purchase claimable. Learned merchants still take precedence
  // over ordinary keyword matching below.
  if (FUEL_KEYWORDS.some(k => matchesKeyword(text, k))) {
    return { category: 'travel', claimable: false, note: 'fuel_excluded' }
  }

  for (const merchant of Object.keys(learnedMerchants)) {
    if (text.includes(merchant.toLowerCase())) {
      return { category: learnedMerchants[merchant], claimable: true }
    }
  }

  for (const cat of CATEGORIES) {
    const hit = [...cat.keywordsEn, ...cat.keywordsKo].some(k => matchesKeyword(text, k))
    if (hit) return { category: cat.key, claimable: true }
  }

  return { category: 'uncategorised', claimable: true }
}
