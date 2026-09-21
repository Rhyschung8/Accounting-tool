export interface Category {
  key: string
  labelKo: string
  labelEn: string
  keywordsEn: string[]
  keywordsKo: string[]
  examplesKo: string[]
  examplesEn: string[]
}

// Order matters: first match wins. uncategorised is the fallback and has no keywords.
export const CATEGORIES: Category[] = [
  { key: 'professional', labelKo: '회비·보험', labelEn: 'Professional fees & insurance',
    keywordsEn: ['dbs', 'insurance', 'ism', 'epta', 'membership', 'subscription'],
    keywordsKo: ['보험', '회비', '멤버십', '구독'],
    examplesKo: ['DBS 신원조회', '배상책임보험', 'ISM/EPTA 회비', '전문 구독료'],
    examplesEn: ['DBS check', 'Public liability insurance', 'ISM/EPTA membership', 'Professional subscriptions'] },
  { key: 'travel', labelKo: '교통비', labelEn: 'Travel',
    keywordsEn: ['train', 'bus', 'parking', 'mileage'],
    keywordsKo: ['기차', '버스', '주차', '교통'],
    examplesKo: ['레슨 갈 때 기차·버스 요금', '주차비', '자동차 마일리지'],
    examplesEn: ['Train/bus fares to lessons', 'Parking fees', 'Car mileage to lessons'] },
  { key: 'equipment', labelKo: '악기·교재', labelEn: 'Equipment & materials',
    keywordsEn: ['sheet music', 'metronome', 'piano tuning', 'tuner', 'strings', 'music book'],
    keywordsKo: ['악보', '메트로놈', '조율', '교재', '피아노'],
    examplesKo: ['악보', '메트로놈', '피아노 조율', '현·소모품', '교재'],
    examplesEn: ['Sheet music', 'Metronome', 'Piano tuning', 'Strings/consumables', 'Music books'] },
  { key: 'marketing', labelKo: '홍보', labelEn: 'Marketing',
    keywordsEn: ['advert', 'flyer', 'website', 'business card', 'printing'],
    keywordsKo: ['광고', '전단', '웹사이트', '명함', '인쇄'],
    examplesKo: ['광고비', '전단지', '웹사이트 호스팅', '명함', '인쇄비'],
    examplesEn: ['Adverts', 'Flyers', 'Website hosting', 'Business cards', 'Printing'] },
  { key: 'home_office', labelKo: '재택근무', labelEn: 'Working from home',
    keywordsEn: ['electricity', 'gas', 'broadband', 'internet', 'heating', 'rent'],
    keywordsKo: ['전기', '가스', '인터넷', '난방', '임대'],
    examplesKo: ['전기요금', '가스요금', '인터넷비', '난방비', '임대료(업무용 비율)'],
    examplesEn: ['Electricity', 'Gas', 'Broadband/internet', 'Heating', 'Rent (business-use share)'] },
  { key: 'training', labelKo: '교육·연수', labelEn: 'Training & CPD',
    keywordsEn: ['course', 'workshop', 'exam fee', 'conference', 'masterclass'],
    keywordsKo: ['강좌', '워크숍', '시험', '학회', '마스터클래스'],
    examplesKo: ['강좌', '워크숍', '시험비', '학회', '마스터클래스'],
    examplesEn: ['Courses', 'Workshops', 'Exam fees', 'Conferences', 'Masterclasses'] },
  { key: 'uncategorised', labelKo: '확인 필요', labelEn: 'Needs checking',
    keywordsEn: [], keywordsKo: [], examplesKo: [], examplesEn: [] },
]
