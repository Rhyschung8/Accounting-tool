import { describe, it, expect } from 'vitest'
import { parsePence, formatPounds } from '../../src/domain/money'

describe('parsePence', () => {
  it('parses plain integers', () => { expect(parsePence('30')).toBe(3000) })
  it('parses pound sign', () => { expect(parsePence('£30')).toBe(3000) })
  it('parses two decimals', () => { expect(parsePence('30.00')).toBe(3000) })
  it('parses one decimal', () => { expect(parsePence('30.5')).toBe(3050) })
  it('parses commas and whitespace', () => { expect(parsePence(' £1,234.56 ')).toBe(123456) })
  it('rounds to nearest penny', () => { expect(parsePence('30.005')).toBe(3001) })
  it('rejects empty', () => { expect(parsePence('')).toBeNull() })
  it('rejects letters', () => { expect(parsePence('abc')).toBeNull() })
  it('rejects negative', () => { expect(parsePence('-5')).toBeNull() })
})

describe('formatPounds', () => {
  it('formats pence to pounds', () => { expect(formatPounds(3000)).toBe('£30.00') })
  it('formats with thousands separator', () => { expect(formatPounds(123456)).toBe('£1,234.56') })
  it('formats zero', () => { expect(formatPounds(0)).toBe('£0.00') })
})
