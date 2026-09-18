// src/ui/BeforeYouFile.tsx
import { useStore } from '../state/useStore'
import { taxYearBounds, taxYearOf } from '../domain/taxYear'

interface Props { taxYear: string }

/** Returns the 12 month strings (YYYY-MM) for a UK tax year (6 Apr – 5 Apr). */
function taxYearMonths(taxYear: string): string[] {
  const startYear = Number(taxYear.split('/')[0])
  const months: string[] = []
  // Apr–Dec of start year
  for (let m = 4; m <= 12; m++) {
    months.push(`${startYear}-${String(m).padStart(2, '0')}`)
  }
  // Jan–Mar of next year
  for (let m = 1; m <= 3; m++) {
    months.push(`${startYear + 1}-${String(m).padStart(2, '0')}`)
  }
  return months
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'January / 1월', '02': 'February / 2월', '03': 'March / 3월',
  '04': 'April / 4월', '05': 'May / 5월', '06': 'June / 6월',
  '07': 'July / 7월', '08': 'August / 8월', '09': 'September / 9월',
  '10': 'October / 10월', '11': 'November / 11월', '12': 'December / 12월',
}

export function BeforeYouFile({ taxYear }: Props) {
  const { state } = useStore()
  const { entries, settings } = state

  // Filter to this tax year, non-deleted
  const yearEntries = entries.filter(e => !e.deletedAt && taxYearOf(e.date) === taxYear)

  // (a) Months with no income logged
  const allMonths = taxYearMonths(taxYear)
  const monthsWithIncome = new Set(
    yearEntries.filter(e => e.type === 'income').map(e => e.date.slice(0, 7))
  )
  const emptyIncomeMonths = allMonths.filter(m => !monthsWithIncome.has(m))

  // (b) Uncategorised entries
  const uncategorisedCount = yearEntries.filter(e => e.category === 'uncategorised').length

  // (c) Large purchases without receipt
  const largePurchasesNoReceipt = yearEntries.filter(
    e => e.type === 'expense' && e.amountPence >= settings.largePurchaseThresholdPence && !e.receiptFile
  )

  // (d) Any home_office entry
  const hasHomeOffice = yearEntries.some(e => e.type === 'home_office')

  return (
    <div className="before-you-file">
      <h2>제출 전 확인 / Before You File — {taxYear}</h2>
      <ul className="before-you-file__checklist">

        {/* (a) Months with no income */}
        <li className="checklist-item">
          {emptyIncomeMonths.length === 0 ? (
            <span className="checklist-item__ok">
              ✓ 모든 달에 수입이 기록됐어요 / Income recorded every month.
            </span>
          ) : (
            <span className="checklist-item__warning">
              ⚠ 수입이 없는 달이 있어요 / Months with no income logged:{' '}
              {emptyIncomeMonths.map(m => MONTH_NAMES[m.slice(5)] ?? m).join(', ')}.
              수업이 없었다면 괜찮아요 — 확인만 해두세요.
              / If you simply didn't teach those months, that's fine — just worth noting.
            </span>
          )}
        </li>

        {/* (b) Uncategorised entries */}
        <li className="checklist-item">
          {uncategorisedCount === 0 ? (
            <span className="checklist-item__ok">
              ✓ 미분류 항목 없음 / No uncategorised entries.
            </span>
          ) : (
            <span className="checklist-item__warning">
              ⚠ 확인 필요 / Needs checking — {uncategorisedCount}개 항목이 아직 분류되지 않았어요 /{' '}
              {uncategorisedCount} {uncategorisedCount === 1 ? 'entry' : 'entries'} still uncategorised.
            </span>
          )}
        </li>

        {/* (c) Large purchases without receipt */}
        <li className="checklist-item">
          {largePurchasesNoReceipt.length === 0 ? (
            <span className="checklist-item__ok">
              ✓ 큰 금액 지출에 모두 영수증이 있어요 / All large purchases have receipts.
            </span>
          ) : (
            <span className="checklist-item__warning">
              ⚠ 영수증 없는 큰 지출 / Large purchase without receipt —{' '}
              {largePurchasesNoReceipt.length}개 /{' '}
              {largePurchasesNoReceipt.length} {largePurchasesNoReceipt.length === 1 ? 'item' : 'items'}.
              영수증을 첨부하면 세무조사 시 유리해요 / Attaching receipts helps in case of a tax inquiry.
            </span>
          )}
        </li>

        {/* (d) Home office confirmed */}
        <li className="checklist-item">
          {hasHomeOffice ? (
            <span className="checklist-item__ok">
              ✓ 재택근무 비용이 기록됐어요 / Home office expenses recorded.
            </span>
          ) : (
            <span className="checklist-item__warning">
              ⚠ 재택근무 항목이 없어요 / No home office entry found.
              집에서 레슨을 하신다면 재택근무 비용을 추가해보세요 /{' '}
              If you teach from home, consider adding a home office entry.
            </span>
          )}
        </li>

      </ul>
    </div>
  )
}
