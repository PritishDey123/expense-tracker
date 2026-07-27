import { currentMonthKey, isInMonth } from '../utils/format'
import type { Expense } from '../api/types'
import './LedgerStub.css'

interface LedgerStubProps {
  items: Expense[]
  now?: Date
}

/** Fixed left panel: this month's running total, computed from currently-loaded entries. */
export function LedgerStub({ items, now = new Date() }: LedgerStubProps) {
  const monthKey = currentMonthKey(now)
  const total = items
    .filter((item) => isInMonth(item.date, monthKey))
    .reduce((sum, item) => sum + item.amount, 0)

  return (
    <aside className="ledger-stub">
      <p className="ledger-stub__label">This month</p>
      <p className="ledger-stub__total">{total.toFixed(2)}</p>
    </aside>
  )
}
