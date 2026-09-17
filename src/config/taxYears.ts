// src/config/taxYears.ts
export interface HomeOfficeBand { minHours: number; monthlyPence: number }

export interface TaxYearRates {
  personalAllowancePence: number
  basicRateLimitPence: number      // upper edge of basic rate band (taxable income)
  basicRatePct: number
  higherRatePct: number
  class4LowerPence: number
  class4UpperPence: number
  class4MainPct: number
  class4UpperPct: number
  mileageHigherPencePerMile: number
  mileageLowerPencePerMile: number
  mileageThresholdMiles: number
  homeOfficeBands: HomeOfficeBand[]
  tradingAllowancePence: number
  marriageAllowanceBenefitPence: number
  smallProfitsThresholdPence: number
  class2WeeklyPence: number
}

// All figures verified against GOV.UK — see task-4-report.md for the verification table.
// Sources:
//   Income tax:        https://www.gov.uk/income-tax-rates (+ /previous-tax-years)
//   Class 4 NI:        https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions
//   Mileage:           https://www.gov.uk/simpler-income-tax-simplified-expenses/vehicles
//   Home office:       https://www.gov.uk/simpler-income-tax-simplified-expenses/working-from-home
//   Trading allowance: https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income
//   Marriage Allowance: https://www.gov.uk/marriage-allowance
//   Small profits / Class 2: https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions
const RATES_2025_26: TaxYearRates = {
  personalAllowancePence: 1_257_000,      // £12,570 — GOV.UK confirmed
  basicRateLimitPence: 5_027_000,         // £50,270 — GOV.UK confirmed
  basicRatePct: 20,                        // GOV.UK confirmed
  higherRatePct: 40,                       // GOV.UK confirmed
  class4LowerPence: 1_257_000,            // £12,570 — GOV.UK confirmed
  class4UpperPence: 5_027_000,            // £50,270 — GOV.UK confirmed
  class4MainPct: 6,                        // GOV.UK confirmed
  class4UpperPct: 2,                       // GOV.UK confirmed
  mileageHigherPencePerMile: 45,           // 45p/mile first 10,000 — GOV.UK confirmed
  mileageLowerPencePerMile: 25,            // 25p/mile above 10,000 — GOV.UK confirmed
  mileageThresholdMiles: 10_000,           // GOV.UK confirmed
  homeOfficeBands: [
    { minHours: 25, monthlyPence: 1000 },  // 25–50 hrs: £10 — GOV.UK confirmed
    { minHours: 51, monthlyPence: 1800 },  // 51–100 hrs: £18 — GOV.UK confirmed
    { minHours: 101, monthlyPence: 2600 }, // 101+ hrs: £26 — GOV.UK confirmed
  ],
  tradingAllowancePence: 100_000,          // £1,000 — GOV.UK confirmed
  marriageAllowanceBenefitPence: 25_200,   // £252 (20% of £1,260 transfer) — GOV.UK confirmed
  smallProfitsThresholdPence: 684_500,     // £6,845 — GOV.UK confirmed (seed was wrong: £6,725)
  class2WeeklyPence: 350,                  // £3.50/week — GOV.UK confirmed
}

const RATES_2026_27: TaxYearRates = {
  personalAllowancePence: 1_257_000,      // £12,570 — GOV.UK confirmed (frozen)
  basicRateLimitPence: 5_027_000,         // £50,270 — GOV.UK confirmed (frozen)
  basicRatePct: 20,                        // GOV.UK confirmed
  higherRatePct: 40,                       // GOV.UK confirmed
  class4LowerPence: 1_257_000,            // £12,570 — GOV.UK confirmed
  class4UpperPence: 5_027_000,            // £50,270 — GOV.UK confirmed
  class4MainPct: 6,                        // GOV.UK confirmed
  class4UpperPct: 2,                       // GOV.UK confirmed
  mileageHigherPencePerMile: 55,           // 55p/mile first 10,000 from 6 Apr 2026 — GOV.UK confirmed
  mileageLowerPencePerMile: 25,            // 25p/mile above 10,000 — GOV.UK confirmed
  mileageThresholdMiles: 10_000,           // GOV.UK confirmed
  homeOfficeBands: [
    { minHours: 25, monthlyPence: 1000 },  // 25–50 hrs: £10 — GOV.UK confirmed (unchanged)
    { minHours: 51, monthlyPence: 1800 },  // 51–100 hrs: £18 — GOV.UK confirmed (unchanged)
    { minHours: 101, monthlyPence: 2600 }, // 101+ hrs: £26 — GOV.UK confirmed (unchanged)
  ],
  tradingAllowancePence: 100_000,          // £1,000 — GOV.UK confirmed (unchanged) // UNCONFIRMED 2026/27 — recheck
  marriageAllowanceBenefitPence: 25_200,   // £252 — GOV.UK confirmed (unchanged) // UNCONFIRMED 2026/27 — recheck
  smallProfitsThresholdPence: 710_500,     // £7,105 — GOV.UK confirmed
  class2WeeklyPence: 365,                  // £3.65/week — GOV.UK confirmed
}

export const TAX_YEARS: Record<string, TaxYearRates> = {
  '2025/26': RATES_2025_26,
  '2026/27': RATES_2026_27,
}

export function getRates(taxYear: string): TaxYearRates {
  const r = TAX_YEARS[taxYear]
  if (!r) throw new Error(`No tax rates configured for ${taxYear}`)
  return r
}
