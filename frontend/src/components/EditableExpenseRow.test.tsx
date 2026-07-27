import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditableExpenseRow } from './EditableExpenseRow'
import type { Expense } from '../api/types'

const expense: Expense = {
  id: '1',
  amount: 42.1,
  category: 'Groceries',
  date: '2026-07-24',
  description: 'Ivy Market',
}

function renderRow(onSave = vi.fn().mockResolvedValue(undefined), onDelete = vi.fn().mockResolvedValue(undefined)) {
  const utils = render(
    <ul>
      <EditableExpenseRow expense={expense} onSave={onSave} onDelete={onDelete} />
    </ul>,
  )
  return { ...utils, onSave, onDelete }
}

describe('EditableExpenseRow', () => {
  it('shows the read-only row by default', () => {
    renderRow()
    expect(screen.getByText('Ivy Market')).toBeInTheDocument()
    expect(screen.queryByLabelText(/amount/i)).not.toBeInTheDocument()
  })

  it('enters edit mode pre-filled with current values', async () => {
    const user = userEvent.setup()
    renderRow()

    await user.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.getByLabelText(/amount/i)).toHaveValue(42.1)
    expect(screen.getByLabelText(/category/i)).toHaveValue('Groceries')
    expect(screen.getByLabelText(/description/i)).toHaveValue('Ivy Market')
  })

  it('saves valid changes and returns to the read-only row', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    renderRow(onSave)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.clear(screen.getByLabelText(/amount/i))
    await user.type(screen.getByLabelText(/amount/i), '60')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).toHaveBeenCalledWith('1', expect.objectContaining({ amount: 60 }))
  })

  it('rejects a zero amount and keeps editing with the original retained', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderRow(onSave)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.clear(screen.getByLabelText(/amount/i))
    await user.type(screen.getByLabelText(/amount/i), '0')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('rejects a cleared description', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderRow(onSave)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.clear(screen.getByLabelText(/description/i))
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('discards changes on cancel and shows the original row', async () => {
    const user = userEvent.setup()
    renderRow()

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.clear(screen.getByLabelText(/amount/i))
    await user.type(screen.getByLabelText(/amount/i), '999')
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByText('Ivy Market')).toBeInTheDocument()
    expect(screen.queryByLabelText(/amount/i)).not.toBeInTheDocument()
  })

  it('shows an error and keeps pre-edit values in the row when saving fails', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockRejectedValue(new Error('Expense not found'))
    renderRow(onSave)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.clear(screen.getByLabelText(/amount/i))
    await user.type(screen.getByLabelText(/amount/i), '60')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText('Expense not found')).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toHaveValue(60)
  })

  it('asks for confirmation before deleting', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderRow(undefined, vi.fn())
    await user.click(screen.getByRole('button', { name: /^delete/i }))

    expect(screen.getByText(/delete this entry/i)).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('removes nothing when the confirmation is cancelled', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderRow()
    await user.click(screen.getByRole('button', { name: /^delete/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByText('Ivy Market')).toBeInTheDocument()
  })

  it('calls onDelete when the confirmation is accepted', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue(undefined)
    renderRow(undefined, onDelete)
    await user.click(screen.getByRole('button', { name: /^delete/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('shows an error and keeps the entry visible when delete fails', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockRejectedValue(new Error('Expense not found'))
    renderRow(undefined, onDelete)
    await user.click(screen.getByRole('button', { name: /^delete/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(await screen.findByText('Expense not found')).toBeInTheDocument()
    expect(screen.getByText('Ivy Market')).toBeInTheDocument()
  })
})
