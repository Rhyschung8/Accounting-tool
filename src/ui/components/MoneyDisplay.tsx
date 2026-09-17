import { formatPounds } from '../../domain/money'

export function MoneyDisplay({ pence }: { pence: number }) {
  return <span className="money">{formatPounds(pence)}</span>
}
