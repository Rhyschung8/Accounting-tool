export function taxYearOf(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const startYear = (m > 4 || (m === 4 && d >= 6)) ? y : y - 1
  const endShort = String((startYear + 1) % 100).padStart(2, '0')
  return `${startYear}/${endShort}`
}

export function taxYearBounds(taxYear: string): { start: string; end: string } {
  const startYear = Number(taxYear.split('/')[0])
  return { start: `${startYear}-04-06`, end: `${startYear + 1}-04-05` }
}

export function currentTaxYear(today: Date = new Date()): string {
  const iso = today.toISOString().slice(0, 10)
  return taxYearOf(iso)
}

export function formatTaxYear(taxYear: string): string {
  const startYear = Number(taxYear.split('/')[0])
  return `6 Apr ${startYear} – 5 Apr ${startYear + 1}`
}
