import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
})
