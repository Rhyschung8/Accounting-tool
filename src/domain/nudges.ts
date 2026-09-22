// src/domain/nudges.ts
import type { FilingFigures } from './filingFigures'
import type { Settings } from '../storage/storage'
import type { TaxYearRates } from '../config/taxYears'
import { formatPounds } from './money'
import { estimate } from './taxEngine'

export type NudgeId = 'must_file' | 'payments_on_account' | 'state_pension' | 'trading_allowance' | 'marriage_allowance'
export interface Nudge {
  id: NudgeId
  titleKo: string; titleEn: string
  bodyKo: string; bodyEn: string
  govUkUrl: string
}

export function computeNudges(figures: FilingFigures, settings: Settings, rates: TaxYearRates): Nudge[] {
  const out: Nudge[] = []

  if (figures.turnoverPence > rates.tradingAllowancePence) {
    out.push({
      id: 'must_file',
      titleKo: '세금 신고를 해야 해요', titleEn: 'You need to file a tax return',
      bodyKo: '수입이 £1,000를 넘으면 예상 세금이 £0이라도 자영업 등록과 자기신고(Self Assessment) 제출이 필요해요. 마감일: 1월 31일.',
      bodyEn: 'Once your income passes £1,000 you must register as self-employed and file a Self Assessment, even if the estimated tax is £0. Deadline: 31 January.',
      govUkUrl: 'https://www.gov.uk/self-assessment-tax-returns',
    })
  }

  // Payments on account: once Income Tax + Class 4 NI for the year tops £1,000,
  // HMRC also collects 50% of next year's estimated bill by 31 January (on top of
  // this year's tax) and the other 50% by 31 July — a common first-year surprise.
  const taxEstimate = estimate(figures.netPence, settings.otherIncomePence, rates)
  if (!taxEstimate.isLoss && taxEstimate.totalPence > 100_000) {
    out.push({
      id: 'payments_on_account',
      titleKo: '선납(Payments on Account) 준비하기', titleEn: 'Payments on account — plan for advance payments',
      bodyKo: '올해 세금과 국민보험이 £1,000를 넘으면, HMRC는 내년 세금의 절반도 미리 내라고 요청해요. 1월 31일에는 올해 세금 전액과 내년 세금 예상액의 절반을, 7월 31일에는 나머지 절반을 내야 해요. 그래서 이 금액을 처음 넘는 해 1월에는, 실제로 내는 돈이 위 예상 세금의 약 1.5배가 될 수 있어요.',
      bodyEn: "If your tax and National Insurance for the year go over £1,000, HMRC will also ask you to pay 50% of next year's estimated bill in advance. On 31 January you pay this year's tax in full plus that 50%; the other 50% is due by 31 July. So in January of the first year this happens, what you pay can be about 1.5 times the estimated tax shown above.",
      govUkUrl: 'https://www.gov.uk/understand-self-assessment-bill/payments-on-account',
    })
  }

  if (figures.netPence > 0 && figures.netPence < rates.smallProfitsThresholdPence) {
    const weeklyRate = formatPounds(rates.class2WeeklyPence)
    out.push({
      id: 'state_pension',
      titleKo: '국가연금 — 자발적 납부를 고려하세요', titleEn: 'State Pension — consider voluntary contributions',
      bodyKo: `이익이 소액이익 기준보다 낮으면 국민보험 크레딧이 자동으로 쌓이지 않아요. 이건 순전히 선택 사항이에요 — 내지 않아도 벌금을 물거나 빚을 지지 않고, 이 해가 국가연금 가입 기간으로 인정되지 않을 뿐이에요. 인정받고 싶다면 자기신고서에서 자발적 Class 2 납부(주당 약 ${weeklyRate})를 선택할 수 있어요.`,
      bodyEn: `Your profit is below the small profits threshold, so you do not get an automatic National Insurance credit. This is entirely optional — nothing is owed if you skip it, you simply won't get a State Pension qualifying year for it. If you'd like the year to count, you can choose to pay voluntary Class 2 contributions (about ${weeklyRate} a week) when you file your Self Assessment.`,
      govUkUrl: 'https://www.gov.uk/self-employed-national-insurance-rates',
    })
  }

  if (figures.turnoverPence > rates.tradingAllowancePence && figures.expensesPence < rates.tradingAllowancePence) {
    out.push({
      id: 'trading_allowance',
      titleKo: '£1,000 거래 공제가 더 유리할 수 있어요', titleEn: 'The £1,000 trading allowance may be better',
      bodyKo: '올해 경비가 £1,000보다 적어요. 실제 경비 대신 £1,000 거래 공제를 청구하면 세금이 더 줄 수 있어요. 두 가지를 비교해 보세요.',
      bodyEn: 'Your expenses this year are under £1,000. Claiming the flat £1,000 trading allowance instead of your actual expenses may reduce your tax more. Worth comparing both.',
      govUkUrl: 'https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income',
    })
  }

  const totalIncome = settings.otherIncomePence + Math.max(0, figures.netPence)
  if (totalIncome < rates.personalAllowancePence && settings.spouseIsBasicRateTaxpayer) {
    out.push({
      id: 'marriage_allowance',
      titleKo: '배우자 공제 이전 — 남은 개인 면세 한도 넘겨주기', titleEn: 'Marriage Allowance — transfer unused allowance',
      bodyKo: '소득이 개인 면세 한도보다 적고 배우자가 기본세율 납세자라면, 남은 개인 면세 한도의 일부를 배우자에게 이전해 매년 약 £252를 절약할 수 있어요. 최대 4년까지 소급 가능해요.',
      bodyEn: 'Your income is below the personal allowance and your spouse is a basic-rate taxpayer, so you can transfer part of your unused allowance to them — worth about £252 a year, and you can backdate it up to four years.',
      govUkUrl: 'https://www.gov.uk/marriage-allowance',
    })
  }

  return out
}
