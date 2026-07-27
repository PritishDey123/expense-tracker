import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewExpenseForm } from './NewExpenseForm'

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/amount/i), '54.99')
  await user.type(screen.getByLabelText(/category/i), 'Utilities')
  await user.type(screen.getByLabelText(/date/i), '2026-07-20')
  await user.type(screen.getByLabelText(/description/i), 'Electricity bill')
}

describe('NewExpenseForm', () => {
  it('submits the entered values and calls onCreated', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<NewExpenseForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await fillValid(user)
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      amount: 54.99,
      category: 'Utilities',
      date: '2026-07-20',
      description: 'Electricity bill',
    })
  })

  it('shows an inline error and does not submit for a zero amount', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<NewExpenseForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText(/amount/i), '0')
    await user.type(screen.getByLabelText(/category/i), 'Utilities')
    await user.type(screen.getByLabelText(/date/i), '2026-07-20')
    await user.type(screen.getByLabelText(/description/i), 'x')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows an inline error and does not submit for a blank category', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<NewExpenseForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText(/amount/i), '10')
    await user.type(screen.getByLabelText(/date/i), '2026-07-20')
    await user.type(screen.getByLabelText(/description/i), 'x')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText(/category is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onCancel and creates nothing when dismissed', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onSubmit = vi.fn()
    render(<NewExpenseForm onSubmit={onSubmit} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows an error and retains entered values when the API call fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Could not save expense'))
    render(<NewExpenseForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await fillValid(user)
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText('Could not save expense')).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toHaveValue(54.99)
  })
})
