export const strings = {
  moneyIn: { ko: '수입', en: 'Money in' },
  moneyOut: { ko: '지출', en: 'Money out' },
  whatsLeft: { ko: '남은 돈', en: "What's left" },
  estimatedTax: { ko: '예상 세금', en: 'Estimated tax' },
  estimateCaveat: { ko: '추정치입니다 — 최종 세금이 아닙니다.', en: 'This is an estimate to help you plan — not your final bill.' },
  gotPaid: { ko: '돈 받았어요', en: 'I got paid' },
  boughtSomething: { ko: '뭔가 샀어요', en: 'I bought something' },
  drove: { ko: '레슨하러 운전했어요', en: 'I drove to a lesson' },
  workedFromHome: { ko: '집에서 일했어요', en: 'I worked from home' },
  seeEverything: { ko: '전체 내역', en: 'See everything' },
  settings: { ko: '설정', en: 'Settings' },
  recentlyDeleted: { ko: '최근 삭제', en: 'Recently deleted' },
  undo: { ko: '되돌리기', en: 'Undo' },
} as const

export type StringKey = keyof typeof strings
export const bilingual = (k: StringKey) => `${strings[k].ko} / ${strings[k].en}`
