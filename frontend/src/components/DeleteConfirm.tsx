import { useState } from 'react'
import './DeleteConfirm.css'

interface DeleteConfirmProps {
  description: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

/** Inline confirmation shown in place of a tape row before a delete is applied. */
export function DeleteConfirm({ description, onConfirm, onCancel }: DeleteConfirmProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete expense')
    }
  }

  return (
    <li className="delete-confirm">
      <p>
        Delete this entry? <span className="delete-confirm__desc">{description}</span>
      </p>
      {error && (
        <p className="delete-confirm__error" role="alert">
          {error}
        </p>
      )}
      <div className="delete-confirm__actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" onClick={handleConfirm}>
          Confirm
        </button>
      </div>
    </li>
  )
}
