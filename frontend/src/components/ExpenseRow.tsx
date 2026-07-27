import { formatAmount, formatDate } from '../utils/format'
import type { Expense } from '../api/types'
import './ExpenseRow.css'

interface ExpenseRowProps {
  expense: Expense
  onEdit?: () => void
  onDelete?: () => void
}

/** One tape entry: date, category, description, ledger-red amount, and row actions. */
export function ExpenseRow({ expense, onEdit, onDelete }: ExpenseRowProps) {
  return (
    <li className="expense-row">
      <span className="expense-row__date">{formatDate(expense.date)}</span>
      <span className="expense-row__category">{expense.category}</span>
      <span className="expense-row__description">{expense.description}</span>
      <span className="expense-row__amount">{formatAmount(expense.amount)}</span>
      {(onEdit || onDelete) && (
        <span className="expense-row__actions">
          {onEdit && (
            <button type="button" onClick={onEdit} aria-label={`Edit ${expense.description}`}>
              Edit
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} aria-label={`Delete ${expense.description}`}>
              Delete
            </button>
          )}
        </span>
      )}
    </li>
  )
}
