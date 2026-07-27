import { formatAmount, formatDate } from '../utils/format'
import type { Expense } from '../api/types'
import './ExpenseRow.css'

interface ExpenseRowProps {
  expense: Expense
}

/** One tape entry: date, category, description, and the ledger-red signed amount. */
export function ExpenseRow({ expense }: ExpenseRowProps) {
  return (
    <li className="expense-row">
      <span className="expense-row__date">{formatDate(expense.date)}</span>
      <span className="expense-row__category">{expense.category}</span>
      <span className="expense-row__description">{expense.description}</span>
      <span className="expense-row__amount">{formatAmount(expense.amount)}</span>
    </li>
  )
}
