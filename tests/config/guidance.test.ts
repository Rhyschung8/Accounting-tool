import { describe, it, expect } from 'vitest'
import { GOOD_TO_KNOW, GLOSSARY } from '../../src/config/guidance'

describe('guidance config', () => {
  it('every topic is bilingual, dated, and links to gov.uk', () => {
    expect(GOOD_TO_KNOW.length).toBeGreaterThanOrEqual(4)
    for (const t of GOOD_TO_KNOW) {
      expect(t.titleKo && t.titleEn && t.bodyKo && t.bodyEn).toBeTruthy()
      expect(t.govUkUrl).toMatch(/^https:\/\/www\.gov\.uk\//)
      expect(t.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
  it('glossary defines the core jargon bilingually', () => {
    const terms = GLOSSARY.map(g => g.termEn.toLowerCase())
    expect(terms).toEqual(expect.arrayContaining(['turnover', 'profit', 'allowance']))
  })
  it('explains late-filing and late-payment penalties', () => {
    const topic = GOOD_TO_KNOW.find(t => t.id === 'penalties')
    expect(topic).toBeDefined()
    expect(topic!.bodyEn).toMatch(/£100/)
    expect(topic!.bodyEn).toMatch(/90 days/)
  })
})
