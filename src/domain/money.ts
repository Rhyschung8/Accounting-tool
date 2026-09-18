export function parsePence(input: string): number | null {
  const cleaned = input.replace(/[£,\s]/g, '')
  if (cleaned === '' || !/^\d+(\.\d+)?$/.test(cleaned)) return null
  const pounds = Number(cleaned)
  if (!Number.isFinite(pounds)) return null
  return Math.round(pounds * 100)
}

export function formatPounds(pence: number): string {
  const pounds = Math.abs(pence) / 100
  return '£' + pounds.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
