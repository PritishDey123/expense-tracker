import './EmptyState.css'

/** Shown when the ledger has no expenses at all — an invitation, not a blank void. */
export function EmptyState() {
  return (
    <div className="empty-state">
      <p className="empty-state__title">No expenses yet</p>
      <p>Record your first expense to start your ledger.</p>
    </div>
  )
}
