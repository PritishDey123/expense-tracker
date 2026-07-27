import { useState } from 'react'
import './FilterControls.css'

export interface Filters {
  category: string
  startDate: string
  endDate: string
}

interface FilterControlsProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const EMPTY: Filters = { category: '', startDate: '', endDate: '' }

// COMPONENT-SIZE-JUSTIFICATION: category + date-range fields share one
// validation rule (start <= end) that must see all three values together;
// splitting per-field would duplicate that check across files.
/** Category and date-range filter controls; applies on change, validates the date range. */
export function FilterControls({ filters, onChange }: FilterControlsProps) {
  const [draft, setDraft] = useState(filters)
  const [error, setError] = useState<string | null>(null)

  function update(next: Filters) {
    setDraft(next)
    if (next.startDate && next.endDate && next.startDate > next.endDate) {
      setError('Start date must not be after end date.')
      return
    }
    setError(null)
    onChange(next)
  }

  return (
    <div className="filter-controls">
      <label htmlFor="filter-category">Filter by category</label>
      <input
        id="filter-category"
        value={draft.category}
        onChange={(e) => update({ ...draft, category: e.target.value })}
      />

      <label htmlFor="filter-from">From</label>
      <input
        id="filter-from"
        type="date"
        value={draft.startDate}
        onChange={(e) => update({ ...draft, startDate: e.target.value })}
      />

      <label htmlFor="filter-to">To</label>
      <input id="filter-to" type="date" value={draft.endDate} onChange={(e) => update({ ...draft, endDate: e.target.value })} />

      {error && (
        <p className="filter-controls__error" role="alert">
          {error}
        </p>
      )}

      <div className="filter-controls__chips">
        {draft.category && <span className="filter-chip">{draft.category}</span>}
        {draft.startDate && <span className="filter-chip">From {draft.startDate}</span>}
        {draft.endDate && <span className="filter-chip">To {draft.endDate}</span>}
      </div>

      <button type="button" onClick={() => update(EMPTY)}>
        Clear filters
      </button>
    </div>
  )
}
