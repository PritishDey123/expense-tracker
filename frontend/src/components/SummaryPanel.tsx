import { useState } from 'react'
import { useSummary } from '../hooks/useSummary'
import { ErrorBanner } from './ErrorBanner'
import './SummaryPanel.css'

interface SummaryPanelProps {
  startDate?: string
  endDate?: string
}

/** Category/month bar-tick breakdown for the stub panel, with a grouping toggle. */
export function SummaryPanel({ startDate, endDate }: SummaryPanelProps) {
  const [groupBy, setGroupBy] = useState<'category' | 'month'>('category')
  const { data, error } = useSummary({ groupBy, startDate, endDate })
  const totals = data?.totals ?? []
  const maxTotal = Math.max(1, ...totals.map((row) => row.total))

  return (
    <div className="summary-panel">
      <div className="summary-panel__toggle">
        <button type="button" aria-pressed={groupBy === 'category'} onClick={() => setGroupBy('category')}>
          Category
        </button>
        <button type="button" aria-pressed={groupBy === 'month'} onClick={() => setGroupBy('month')}>
          Month
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {!error && totals.length === 0 && <p className="summary-panel__empty">No spending in this period.</p>}

      {!error && totals.length > 0 && (
        <ul className="summary-panel__list">
          {totals.map((row) => (
            <li key={row.key} className="summary-panel__row">
              <span className="summary-panel__key">{row.key}</span>
              <span className="summary-panel__bar" style={{ width: `${(row.total / maxTotal) * 100}%` }} />
              <span className="summary-panel__total">{row.total.toFixed(2)}</span>
            </li>
          ))}
          <li className="summary-panel__overall">{data?.overall_total.toFixed(2)}</li>
        </ul>
      )}
    </div>
  )
}
