import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import * as client from './api/client'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('App', () => {
  it('renders the ledger tape and this-month total once expenses load', async () => {
    vi.spyOn(client, 'listExpenses').mockResolvedValue({
      items: [{ id: '1', amount: 42.1, category: 'Groceries', date: '2026-07-24', description: 'Ivy Market' }],
      page: 1,
      page_size: 20,
      total: 1,
      has_next: false,
    })

    render(<App />)

    await waitFor(() => expect(screen.getByText('Ivy Market')).toBeInTheDocument())
    expect(screen.getByText(/this month/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument()
  })

  it('shows the empty state when there are no expenses', async () => {
    vi.spyOn(client, 'listExpenses').mockResolvedValue({
      items: [],
      page: 1,
      page_size: 20,
      total: 0,
      has_next: false,
    })

    render(<App />)

    await waitFor(() => expect(screen.getByText(/no expenses yet/i)).toBeInTheDocument())
  })

  it('shows an error banner when the initial load fails', async () => {
    vi.spyOn(client, 'listExpenses').mockRejectedValue(new client.ApiError('Could not retrieve expenses', 500))

    render(<App />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not retrieve expenses'))
  })

  it('creates a new expense and prepends it to the tape', async () => {
    const user = userEvent.setup()
    vi.spyOn(client, 'listExpenses').mockResolvedValue({
      items: [{ id: '1', amount: 10, category: 'Food', date: '2026-07-20', description: 'old' }],
      page: 1,
      page_size: 20,
      total: 1,
      has_next: false,
    })
    vi.spyOn(client, 'createExpense').mockResolvedValue({
      id: '2',
      amount: 54.99,
      category: 'Utilities',
      date: '2026-07-20',
      description: 'Electricity bill',
    })

    render(<App />)
    await waitFor(() => expect(screen.getByText('old')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /new/i }))
    await user.type(screen.getByLabelText(/amount/i), '54.99')
    await user.type(screen.getByLabelText(/category/i), 'Utilities')
    await user.type(screen.getByLabelText(/date/i), '2026-07-20')
    await user.type(screen.getByLabelText(/description/i), 'Electricity bill')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(screen.getByText('Electricity bill')).toBeInTheDocument())
    const rows = screen.getAllByText(/old|Electricity bill/)
    expect(rows[0]).toHaveTextContent('Electricity bill')
    expect(screen.queryByLabelText(/amount/i)).not.toBeInTheDocument()
  })
})
