import { describe, it, expect } from 'vitest'
import { categorise } from '../../src/domain/categoriser'

describe('categorise', () => {
  it('matches an English keyword, case-insensitive', () => {
    expect(categorise('Train to London', {})).toMatchObject({ category: 'travel', claimable: true })
  })
  it('matches a Korean keyword', () => {
    expect(categorise('악보 구입', {}).category).toBe('equipment') // 악보 = sheet music
  })
  it('detects fuel and marks it not claimable', () => {
    expect(categorise('SHELL FOREST RD', {})).toEqual({ category: 'travel', claimable: false, note: 'fuel_excluded' })
  })
  it('keeps parking claimable', () => {
    expect(categorise('NCP parking', {})).toMatchObject({ category: 'travel', claimable: true })
  })
  it('falls back to uncategorised', () => {
    expect(categorise('Mystery shop', {})).toMatchObject({ category: 'uncategorised', claimable: true })
  })
  it('first match wins in category order', () => {
    // "insurance" (professional) before generic words
    expect(categorise('Music teacher insurance', {}).category).toBe('professional')
  })
  it('learned merchant overrides keywords', () => {
    expect(categorise('HOBGOBLIN MUSIC', { 'hobgoblin music': 'equipment' }).category).toBe('equipment')
  })
})
