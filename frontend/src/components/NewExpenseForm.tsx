import { useState, type FormEvent } from 'react'
import type { NewExpenseInput } from '../api/types'
import './NewExpenseForm.css'

// COMPONENT-SIZE-JUSTIFICATION: four labeled fields + inline validation +
// submit/cancel must stay in one form to keep the field/error mapping
// readable. Splitting per-field would scatter the validation rules in §Interaction notes.
interface NewExpenseFormProps {
  onSubmit: (input: NewExpenseInput) => Promise<void>
  onCancel: () => void
}

/** Compact "feeding paper into a register" form — slides in above the tape. */
export function NewExpenseForm({ onSubmit, onCancel }: NewExpenseFormProps) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  function validate(): string | null {
    if (!(Number(amount) > 0)) return 'Amount must be greater than 0.'
    if (!category.trim()) return 'Category is required.'
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
      await onSubmit({ amount: Number(amount), category, date, description })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save expense')
    }
  }

  return (
    <form className="new-expense-form" onSubmit={handleSubmit}>
      {error && (
        <p className="new-expense-form__error" role="alert">
          {error}
        </p>
      )}
      <label htmlFor="new-expense-amount">Amount</label>
      <input id="new-expense-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />

      <label htmlFor="new-expense-category">Category</label>
      <input id="new-expense-category" value={category} onChange={(e) => setCategory(e.target.value)} />

      <label htmlFor="new-expense-date">Date</label>
      <input id="new-expense-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label htmlFor="new-expense-description">Description</label>
      <input id="new-expense-description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="new-expense-form__actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit">Save</button>
      </div>
    </form>
  )
}
