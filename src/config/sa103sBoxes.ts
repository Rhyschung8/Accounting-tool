// src/config/sa103sBoxes.ts
// SA103S box numbers/labels — VERIFY against the current HMRC SA103S form + notes.
// This app targets the 2025/26 self-employment (short) return.
export interface Sa103Box { number: string; labelKo: string; labelEn: string }

// NOTE TO IMPLEMENTER: confirm each `number` below against the live SA103S form.
export const TURNOVER_BOX: Sa103Box = {
  number: '9',
  labelKo: '매출(총 수입)',
  labelEn: 'Your turnover (total takings)',
}
export const EXPENSES_BOX: Sa103Box = {
  number: '20',
  labelKo: '총 필요경비',
  labelEn: 'Total allowable expenses',
}
export const NET_PROFIT_BOX: Sa103Box = {
  number: '21',
  labelKo: '순이익',
  labelEn: 'Net profit',
}
export const NET_LOSS_BOX: Sa103Box = {
  number: '22',
  labelKo: '순손실',
  labelEn: 'Net loss',
}

export const CATEGORY_BOX_NOTES: Record<string, { labelKo: string; labelEn: string }> = {
  travel: { labelKo: '교통비', labelEn: 'Travel (incl. mileage)' },
  equipment: { labelKo: '악기·교재', labelEn: 'Equipment & materials' },
  professional: { labelKo: '회비·보험', labelEn: 'Professional fees & insurance' },
  marketing: { labelKo: '홍보', labelEn: 'Marketing' },
  home_office: { labelKo: '재택근무', labelEn: 'Working from home' },
  training: { labelKo: '교육·연수', labelEn: 'Training & CPD' },
  uncategorised: { labelKo: '확인 필요', labelEn: 'Needs checking' },
}

const BY_ROLE = {
  turnover: TURNOVER_BOX,
  expenses: EXPENSES_BOX,
  netProfit: NET_PROFIT_BOX,
  netLoss: NET_LOSS_BOX,
} as const

export function getBox(role: keyof typeof BY_ROLE): Sa103Box {
  return BY_ROLE[role]
}
