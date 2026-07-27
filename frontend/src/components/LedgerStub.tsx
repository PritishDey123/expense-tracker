import { currentMonthKey, isInMonth } from '../utils/format'
import { FilterControls, type Filters } from './FilterControls'
import { SummaryPanel } from './SummaryPanel'
import type { Expense } from '../api/types'
import './LedgerStub.css'

interface LedgerStubProps {
  items: Expense[]
  now?: Date
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

/** Fixed left panel: this month's total, the filter controls, and the spending summary. */
export function LedgerStub({ items, now = new Date(), filters, onFiltersChange }: LedgerStubProps) {
  const monthKey = currentMonthKey(now)
  const total = items
    .filter((item) => isInMonth(item.date, monthKey))
    .reduce((sum, item) => sum + item.amount, 0)

  return (
    <aside className="ledger-stub">
      <p className="ledger-stub__label">This month</p>
      <p className="ledger-stub__total">{total.toFixed(2)}</p>
      <FilterControls filters={filters} onChange={onFiltersChange} />
      <SummaryPanel startDate={filters.startDate || undefined} endDate={filters.endDate || undefined} />
    </aside>
  )
}
