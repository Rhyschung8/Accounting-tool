import type { TaxYearRates } from '../config/taxYears'

export function mileagePence(miles: number, rates: TaxYearRates, milesAlreadyThisYear = 0): number {
  const remainingHigher = Math.max(0, rates.mileageThresholdMiles - milesAlreadyThisYear)
  const higherMiles = Math.min(miles, remainingHigher)
  const lowerMiles = miles - higherMiles
  return Math.round(
    higherMiles * rates.mileageHigherPencePerMile +
    lowerMiles * rates.mileageLowerPencePerMile,
  )
}
