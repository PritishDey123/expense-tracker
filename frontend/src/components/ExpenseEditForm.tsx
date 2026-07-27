import { useState, type FormEvent } from 'react'
import type { Expense, ExpenseEditInput } from '../api/types'
import './ExpenseEditForm.css'

// COMPONENT-SIZE-JUSTIFICATION: four labeled+id-namespaced fields plus
// inline validation and save/cancel must stay together — splitting would
// scatter the per-field id/label pairing used to keep multiple open rows
// from colliding on element ids.
interface ExpenseEditFormProps {
  expense: Expense
  onSave: (changes: ExpenseEditInput) => Promise<void>
  onCancel: () => void
}

/** Inline edit form for one tape row, pre-filled with the entry's current values. */
export function ExpenseEditForm({ expense, onSave, onCancel }: ExpenseEditFormProps) {
  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState(expense.category)
  const [date, setDate] = useState(expense.date)
  const [description, setDescription] = useState(expense.description)
  const [error, setError] = useState<string | null>(null)

  function validate(): string | null {
    if (!(Number(amount) > 0)) return 'Amount must be greater than 0.'
    if (!description.trim()) return 'Description is required.'
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    try {
      await onSave({ amount: Number(amount), category, date, description })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes')
    }
  }

  return (
    <li className="expense-edit-form">
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="expense-edit-form__error" role="alert">
            {error}
          </p>
        )}
        <label htmlFor={`edit-amount-${expense.id}`}>Amount</label>
        <input
          id={`edit-amount-${expense.id}`}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label htmlFor={`edit-category-${expense.id}`}>Category</label>
        <input id={`edit-category-${expense.id}`} value={category} onChange={(e) => setCategory(e.target.value)} />

        <label htmlFor={`edit-date-${expense.id}`}>Date</label>
        <input id={`edit-date-${expense.id}`} type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label htmlFor={`edit-description-${expense.id}`}>Description</label>
        <input
          id={`edit-description-${expense.id}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="expense-edit-form__actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </li>
  )
}
