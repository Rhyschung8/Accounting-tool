export interface GuidanceTopic {
  id: string
  titleKo: string
  titleEn: string
  bodyKo: string
  bodyEn: string
  govUkUrl: string
  checkedOn: string
}

/**
 * Self-employment guidance topics shown in the app's "Good to know" section.
 * Every fact verified against GOV.UK on checkedOn date.
 */
export const GOOD_TO_KNOW: GuidanceTopic[] = [
  {
    id: 'what-self-employed-means',
    titleKo: '자영업자란 무엇인가요?',
    titleEn: 'What being self-employed means',
    bodyKo:
      '피아노 레슨으로 수입을 얻고 있다면 자영업자로 HMRC에 등록해야 합니다. ' +
      '등록하면 고유 납세자 번호(UTR)가 발급되며, 이 번호로 자기신고(Self Assessment) 세금 신고서를 제출합니다. ' +
      '등록하지 않으면 벌금이 부과될 수 있으므로 수입이 발생한 세금 연도가 끝난 후 빠르게 등록하는 것이 중요합니다. ' +
      '소득이 적더라도 자영업 수입이 있으면 HMRC에 알려야 합니다.',
    bodyEn:
      'If you earn money from piano lessons you must register with HMRC as self-employed. ' +
      'Once registered you will receive a Unique Taxpayer Reference (UTR), which you use when submitting your Self Assessment tax return. ' +
      'Failing to register can result in a penalty, so it is important to register promptly after the end of the tax year in which you first earned income. ' +
      'Even if your earnings are modest, you must tell HMRC if you have self-employment income.',
    govUkUrl: 'https://www.gov.uk/register-for-self-assessment',
    checkedOn: '2026-09-18',
  },
  {
    id: 'what-you-can-claim',
    titleKo: '무엇을 비용으로 청구할 수 있나요?',
    titleEn: 'What you can claim as expenses',
    bodyKo:
      '레슨과 직접 관련된 비용은 소득에서 공제할 수 있습니다. 여기에는 전문 회비·보험, 교통비, 악기·교재, 홍보비, 재택근무비, 교육·연수비가 포함됩니다. ' +
      '차량을 사용한다면 실제 유류비 대신 마일당 정액 요율(마일리지 요율)을 사용하거나 실제 비용을 청구할 수 있으나, 두 방법을 동시에 사용할 수는 없습니다. ' +
      '재택근무를 한다면 복잡한 계산 없이 주당 근무 시간에 따른 정액 요율을 사용할 수 있습니다. ' +
      '현금주의(Cash Basis)로 신고한다면, 피아노 같은 업무용 장비를 구입한 해에 바로 전액 비용으로 공제할 수 있습니다.',
    bodyEn:
      'You can deduct costs directly related to your teaching from your income across six categories: professional fees and insurance, travel, equipment and materials, marketing, working from home, and training. ' +
      'For vehicle costs you can either use the flat mileage rate instead of actual petrol and running costs, or claim actual costs — you cannot use both methods for the same vehicle. ' +
      'For working from home you can use a flat rate based on how many hours per month you work there, avoiding complex calculations. ' +
      'Under Cash Basis accounting, equipment such as a piano used for your business can be deducted in full in the year you buy it, rather than spread over several years.',
    govUkUrl: 'https://www.gov.uk/expenses-if-youre-self-employed',
    checkedOn: '2026-09-18',
  },
  {
    id: 'key-dates',
    titleKo: '중요한 날짜',
    titleEn: 'Key dates to remember',
    bodyKo:
      '영국 세금 연도는 매년 4월 5일에 끝납니다. 예를 들어 2025/26 세금 연도는 2026년 4월 5일에 마감됩니다. ' +
      '자영업자로 새로 등록해야 한다면, 해당 세금 연도가 끝난 다음 해 10월 5일까지 HMRC에 알려야 합니다. ' +
      '온라인으로 세금 신고서를 제출하고 세금을 납부하는 마감일은 모두 이듬해 1월 31일입니다. ' +
      '이 날짜들을 놓치면 자동으로 벌금이 부과되므로 미리 일정표에 표시해 두는 것이 좋습니다.',
    bodyEn:
      'The UK tax year ends on 5 April each year — for example, the 2025/26 tax year ends on 5 April 2026. ' +
      'If you need to register for Self Assessment as a new self-employed person, you must tell HMRC by 5 October following the end of that tax year. ' +
      'The deadline for submitting your online tax return and paying any tax owed is 31 January of the following year. ' +
      'Missing these dates triggers automatic penalties, so mark them in your calendar well in advance.',
    govUkUrl: 'https://www.gov.uk/self-assessment-tax-returns',
    checkedOn: '2026-09-18',
  },
  {
    id: 'words-you-might-see',
    titleKo: '자주 보이는 용어들',
    titleEn: 'Words you might see',
    bodyKo:
      '세금 서류에는 낯선 단어들이 많이 나옵니다. 주요 용어는 다음 용어집을 참고하시기 바랍니다. ' +
      '모르는 내용이 있으면 HMRC 웹사이트나 공인 세무사에게 문의하는 것이 좋습니다. ' +
      '이 앱의 용어집은 피아노 강사에게 가장 관련 있는 단어들을 쉽게 설명해 드립니다.',
    bodyEn:
      'Tax documents often contain unfamiliar words. Refer to the glossary below for plain-language explanations of the most common terms. ' +
      'If you are unsure about anything, the HMRC website or a qualified accountant can help. ' +
      'The glossary in this app focuses on the terms most relevant to piano teachers.',
    govUkUrl: 'https://www.gov.uk/self-assessment-tax-returns',
    checkedOn: '2026-09-18',
  },
]

export interface GlossaryEntry {
  termKo: string
  termEn: string
  meaningKo: string
  meaningEn: string
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    termKo: '총수입(매출액)',
    termEn: 'Turnover',
    meaningKo: '레슨비, 연주료 등 사업으로 벌어들인 모든 수입의 합계입니다. 비용을 빼기 전 금액입니다.',
    meaningEn: 'The total income your business received — all your lesson fees and performance fees added together, before any costs are deducted.',
  },
  {
    termKo: '이익(순이익)',
    termEn: 'Profit',
    meaningKo: '총수입에서 허용된 비용을 뺀 금액입니다. 세금은 이 이익을 기준으로 계산됩니다.',
    meaningEn: 'Your turnover minus your allowable expenses. Tax is calculated on your profit, not your total income.',
  },
  {
    termKo: '공제 한도(면세 한도)',
    termEn: 'Allowance',
    meaningKo: '세금을 내지 않아도 되는 소득 한도액입니다. 예를 들어 개인 면세 한도(Personal Allowance)는 누구에게나 기본으로 주어지는 비과세 소득 구간입니다.',
    meaningEn: 'An amount of income you can earn without paying tax on it. For example, the Personal Allowance is the amount everyone can earn tax-free each year.',
  },
  {
    termKo: '자기신고(셀프 어세스먼트)',
    termEn: 'Self Assessment',
    meaningKo: 'HMRC가 자동으로 세금을 계산하는 직장인과 달리, 자영업자가 직접 세금 신고서를 작성하고 납부 금액을 계산하는 제도입니다.',
    meaningEn: 'The system HMRC uses for self-employed people to report their own income and calculate the tax they owe, rather than having it deducted automatically by an employer.',
  },
  {
    termKo: '현금주의(캐시 베이시스)',
    termEn: 'Cash Basis',
    meaningKo: '돈을 실제로 받거나 지불한 시점에 수입과 비용을 기록하는 방식입니다. 대부분의 소규모 자영업자에게 기본으로 적용되는 간단한 회계 방식입니다.',
    meaningEn: 'A simple way of keeping accounts where you record income when you receive it and expenses when you pay them. It is the default method for most small self-employed people.',
  },
  {
    termKo: '4종 국민보험료',
    termEn: 'Class 4',
    meaningKo: '연간 이익이 일정 기준을 넘는 자영업자가 납부하는 국민보험료(NIC)입니다. 소득세와 함께 1월 31일까지 납부합니다.',
    meaningEn: 'A type of National Insurance Contribution (NIC) paid by self-employed people whose annual profit exceeds a threshold. It is paid alongside income tax by the 31 January deadline.',
  },
]
