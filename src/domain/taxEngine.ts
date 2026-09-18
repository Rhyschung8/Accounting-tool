import type { TaxYearRates } from '../config/taxYears'

export interface TaxEstimate {
  profitPence: number
  incomeTaxPence: number
  class4Pence: number
  totalPence: number
  isLoss: boolean
}

export function estimate(profitPence: number, otherIncomePence: number, rates: TaxYearRates): TaxEstimate {
  if (profitPence < 0) {
    return { profitPence, incomeTaxPence: 0, class4Pence: 0, totalPence: 0, isLoss: true }
  }

  // Allowance is consumed by other income first, then by profit.
  const allowanceLeftForProfit = Math.max(0, rates.personalAllowancePence - otherIncomePence)
  const taxableProfit = Math.max(0, profitPence - allowanceLeftForProfit)

  // Basic/higher bands measured on total taxable income above the allowance.
  const bandWidth = rates.basicRateLimitPence - rates.personalAllowancePence
  const otherTaxableAbove = Math.max(0, otherIncomePence - rates.personalAllowancePence)
  const basicRoom = Math.max(0, bandWidth - otherTaxableAbove)
  const basicPart = Math.min(taxableProfit, basicRoom)
  const higherPart = taxableProfit - basicPart
  const incomeTaxPence = Math.round(
    basicPart * rates.basicRatePct / 100 + higherPart * rates.higherRatePct / 100,
  )

  // Class 4 NI on profit only, between the class-4 thresholds.
  const class4Main = Math.max(0, Math.min(profitPence, rates.class4UpperPence) - rates.class4LowerPence)
  const class4Upper = Math.max(0, profitPence - rates.class4UpperPence)
  const class4Pence = Math.round(
    class4Main * rates.class4MainPct / 100 + class4Upper * rates.class4UpperPct / 100,
  )

  return {
    profitPence,
    incomeTaxPence,
    class4Pence,
    totalPence: incomeTaxPence + class4Pence,
    isLoss: false,
  }
}
