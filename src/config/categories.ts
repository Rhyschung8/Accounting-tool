export interface Category {
  key: string
  labelKo: string
  labelEn: string
  keywordsEn: string[]
  keywordsKo: string[]
}

// Order matters: first match wins. uncategorised is the fallback and has no keywords.
export const CATEGORIES: Category[] = [
  { key: 'professional', labelKo: '회비·보험', labelEn: 'Professional fees & insurance',
    keywordsEn: ['dbs', 'insurance', 'ism', 'epta', 'membership', 'subscription'],
    keywordsKo: ['보험', '회비', '멤버십', '구독'] },
  { key: 'travel', labelKo: '교통비', labelEn: 'Travel',
    keywordsEn: ['train', 'bus', 'parking', 'mileage'],
    keywordsKo: ['기차', '버스', '주차', '교통'] },
  { key: 'equipment', labelKo: '악기·교재', labelEn: 'Equipment & materials',
    keywordsEn: ['sheet music', 'metronome', 'piano tuning', 'tuner', 'strings', 'music book'],
    keywordsKo: ['악보', '메트로놈', '조율', '교재', '피아노'] },
  { key: 'marketing', labelKo: '홍보', labelEn: 'Marketing',
    keywordsEn: ['advert', 'flyer', 'website', 'business card', 'printing'],
    keywordsKo: ['광고', '전단', '웹사이트', '명함', '인쇄'] },
  { key: 'home_office', labelKo: '재택근무', labelEn: 'Working from home',
    keywordsEn: ['electricity', 'gas', 'broadband', 'internet', 'heating', 'rent'],
    keywordsKo: ['전기', '가스', '인터넷', '난방', '임대'] },
  { key: 'training', labelKo: '교육·연수', labelEn: 'Training & CPD',
    keywordsEn: ['course', 'workshop', 'exam fee', 'conference', 'masterclass'],
    keywordsKo: ['강좌', '워크숍', '시험', '학회', '마스터클래스'] },
  { key: 'uncategorised', labelKo: '확인 필요', labelEn: 'Needs checking', keywordsEn: [], keywordsKo: [] },
]
