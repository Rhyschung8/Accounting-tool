import { describe, it, expect } from 'vitest'
import { mileagePence } from '../../src/domain/mileage'
import { getRates } from '../../src/config/taxYears'

const r = getRates('2025/26')

describe('mileagePence', () => {
  it('applies the higher rate under the threshold', () => {
    expect(mileagePence(10, r)).toBe(10 * r.mileageHigherPencePerMile)
  })
  it('rounds to whole pence', () => {
    expect(Number.isInteger(mileagePence(3.3, r))).toBe(true)
  })
  it('applies the lower rate above the threshold', () => {
    expect(mileagePence(1, r, r.mileageThresholdMiles)).toBe(r.mileageLowerPencePerMile)
  })
  it('splits a journey that crosses the threshold', () => {
    const miles = 100
    const already = r.mileageThresholdMiles - 40 // 40 at higher, 60 at lower
    expect(mileagePence(miles, r, already))
      .toBe(40 * r.mileageHigherPencePerMile + 60 * r.mileageLowerPencePerMile)
  })
})
