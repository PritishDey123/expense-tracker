import { useState } from 'react'
import { ExpenseRow } from './ExpenseRow'
import { ExpenseEditForm } from './ExpenseEditForm'
import { DeleteConfirm } from './DeleteConfirm'
import type { Expense, ExpenseEditInput } from '../api/types'

type Mode = 'view' | 'edit' | 'delete'

interface EditableExpenseRowProps {
  expense: Expense
  onSave: (id: string, changes: ExpenseEditInput) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

/** Toggles a tape row between its read-only display, the edit form, and delete confirmation. */
export function EditableExpenseRow({ expense, onSave, onDelete }: EditableExpenseRowProps) {
  const [mode, setMode] = useState<Mode>('view')

  async function handleSave(changes: ExpenseEditInput) {
    await onSave(expense.id, changes)
    setMode('view')
  }

  if (mode === 'edit') {
    return <ExpenseEditForm expense={expense} onSave={handleSave} onCancel={() => setMode('view')} />
  }

  if (mode === 'delete' && onDelete) {
    return (
      <DeleteConfirm
        description={expense.description}
        onConfirm={() => onDelete(expense.id)}
        onCancel={() => setMode('view')}
      />
    )
  }

  return (
    <ExpenseRow
      expense={expense}
      onEdit={() => setMode('edit')}
      onDelete={onDelete ? () => setMode('delete') : undefined}
    />
  )
}
