import { useState } from 'react'
import { ExpenseRow } from './ExpenseRow'
import { ExpenseEditForm } from './ExpenseEditForm'
import type { Expense, ExpenseEditInput } from '../api/types'

interface EditableExpenseRowProps {
  expense: Expense
  onSave: (id: string, changes: ExpenseEditInput) => Promise<void>
}

/** Toggles a tape row between its read-only display and the inline edit form. */
export function EditableExpenseRow({ expense, onSave }: EditableExpenseRowProps) {
  const [isEditing, setIsEditing] = useState(false)

  async function handleSave(changes: ExpenseEditInput) {
    await onSave(expense.id, changes)
    setIsEditing(false)
  }

  if (isEditing) {
    return <ExpenseEditForm expense={expense} onSave={handleSave} onCancel={() => setIsEditing(false)} />
  }

  return <ExpenseRow expense={expense} onEdit={() => setIsEditing(true)} />
}
