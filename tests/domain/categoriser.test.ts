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
  it('fuel beats a colliding learned merchant (N1)', () => {
    // A learned mapping that would otherwise make it claimable must not override fuel detection.
    const result = categorise('Shell petrol', { 'shell': 'equipment' })
    expect(result).toEqual({ category: 'travel', claimable: false, note: 'fuel_excluded' })
  })
  it('does NOT flag fuel when bp is only a substring of another word', () => {
    const result = categorise('Pubcrawl tickets', {})
    expect(result).toMatchObject({ category: 'uncategorised', claimable: true })
    expect(result.note).toBeUndefined()
  })
  it('DOES detect bp as a standalone fuel keyword', () => {
    expect(categorise('BP GARAGE', {})).toEqual({ category: 'travel', claimable: false, note: 'fuel_excluded' })
  })
  it('does NOT categorise a description where "strings" appears only as part of another word', () => {
    // "hamstrings" contains "strings" as a substring — old code would false-positive; word-boundary matching must not
    const result = categorise('Hamstrings physio session', {})
    expect(result.category).not.toBe('equipment')
  })
})
