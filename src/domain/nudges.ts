// src/domain/nudges.ts
import type { FilingFigures } from './filingFigures'
import type { Settings } from '../storage/storage'
import type { TaxYearRates } from '../config/taxYears'
import { formatPounds } from './money'

export type NudgeId = 'must_file' | 'state_pension' | 'trading_allowance' | 'marriage_allowance'
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

  if (figures.netPence > 0 && figures.netPence < rates.smallProfitsThresholdPence) {
    const weeklyRate = formatPounds(rates.class2WeeklyPence)
    out.push({
      id: 'state_pension',
      titleKo: '국가연금 — 자발적 납부를 고려하세요', titleEn: 'State Pension — consider voluntary contributions',
      bodyKo: `이익이 소액이익 기준보다 낮으면 국민보험 크레딧이 자동으로 쌓이지 않아요. 자발적 Class 2 납부(주당 약 ${weeklyRate})로 그 해를 국가연금 가입 기간으로 인정받을 수 있어요.`,
      bodyEn: `Your profit is below the small profits threshold, so you do not get an automatic National Insurance credit. Paying voluntary Class 2 contributions (about ${weeklyRate} a week) keeps this year counting towards your State Pension.`,
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
