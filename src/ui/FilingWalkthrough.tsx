// src/ui/FilingWalkthrough.tsx
import type { FilingFigures } from '../domain/filingFigures'
import { getBox, CATEGORY_BOX_NOTES } from '../config/sa103sBoxes'
import { MoneyDisplay } from './components/MoneyDisplay'
import { CATEGORIES } from '../config/categories'

interface Props { figures: FilingFigures }

function categoryLabel(key: string): { labelKo: string; labelEn: string } {
  if (CATEGORY_BOX_NOTES[key]) return CATEGORY_BOX_NOTES[key]
  const cat = CATEGORIES.find(c => c.key === key)
  if (cat) return { labelKo: cat.labelKo, labelEn: cat.labelEn }
  return { labelKo: key, labelEn: key }
}

export function FilingWalkthrough({ figures }: Props) {
  const turnoverBox = getBox('turnover')
  const expensesBox = getBox('expenses')
  const netProfitBox = getBox('netProfit')
  const netLossBox = getBox('netLoss')

  return (
    <ol className="filing-walkthrough">
      {/* Step 1: Register / log in */}
      <li className="filing-step filing-step--intro">
        <h3>1단계 / Step 1</h3>
        <p>
          GOV.UK에 로그인하거나 개인 세금 계정(Personal Tax Account)에 등록하세요.
          <br />
          Log in to GOV.UK or register for a Personal Tax Account.
        </p>
        <p>
          자영업(단기) 양식 SA103S를 선택하세요.
          <br />
          Select the Self-Employment (Short) form SA103S.
        </p>
      </li>

      {/* Step 2: Turnover */}
      <li className="filing-step filing-step--turnover">
        <h3>2단계 / Step 2 — 칸 {turnoverBox.number}</h3>
        <p>
          <strong>{turnoverBox.labelKo} / {turnoverBox.labelEn}</strong>
        </p>
        <p className="filing-step__amount">
          <MoneyDisplay pence={figures.turnoverPence} />
        </p>
      </li>

      {/* Step 3: Total allowable expenses */}
      <li className="filing-step filing-step--expenses">
        <h3>3단계 / Step 3 — 칸 {expensesBox.number}</h3>
        <p>
          <strong>{expensesBox.labelKo} / {expensesBox.labelEn}</strong>
        </p>
        <p className="filing-step__amount">
          <MoneyDisplay pence={figures.expensesPence} />
        </p>
        {figures.byCategory.length > 0 && (
          <details className="filing-step__breakdown">
            <summary>참고 / for your records</summary>
            <ul>
              {figures.byCategory.map(({ key, amountPence }) => {
                const lbl = categoryLabel(key)
                return (
                  <li key={key}>
                    {lbl.labelKo} / {lbl.labelEn}: <MoneyDisplay pence={amountPence} />
                  </li>
                )
              })}
            </ul>
          </details>
        )}
      </li>

      {/* Step 4: Net profit or loss */}
      {!figures.isLoss ? (
        <li className="filing-step filing-step--profit">
          <h3>4단계 / Step 4 — 칸 {netProfitBox.number}</h3>
          <p>
            <strong>{netProfitBox.labelKo} / {netProfitBox.labelEn}</strong>
          </p>
          <p className="filing-step__amount">
            <MoneyDisplay pence={figures.netPence} />
          </p>
        </li>
      ) : (
        <li className="filing-step filing-step--loss">
          <h3>4단계 / Step 4 — 칸 {netLossBox.number}</h3>
          <p>
            <strong>{netLossBox.labelKo} / {netLossBox.labelEn}</strong>
          </p>
          <p className="filing-step__amount">
            <MoneyDisplay pence={Math.abs(figures.netPence)} />
          </p>
          <p className="filing-step__loss-note">
            손실은 보통 다음 해 이익에서 공제할 수 있어요 / A loss can usually be carried forward against next year's profit.
          </p>
        </li>
      )}
    </ol>
  )
}
