import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryPanel } from './SummaryPanel'
import * as client from '../api/client'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('SummaryPanel', () => {
  it('renders a bar tick per category summing to the overall total', async () => {
    vi.spyOn(client, 'getSummary').mockResolvedValue({
      group_by: 'category',
      totals: [
        { key: 'Food', total: 30 },
        { key: 'Uncategorized', total: 10 },
      ],
      overall_total: 40,
    })

    render(<SummaryPanel />)

    await waitFor(() => expect(screen.getByText('Food')).toBeInTheDocument())
    expect(screen.getByText('Uncategorized')).toBeInTheDocument()
    expect(screen.getByText('40.00')).toBeInTheDocument()
  })

  it('switches to month grouping via the toggle', async () => {
    const user = userEvent.setup()
    const spy = vi
      .spyOn(client, 'getSummary')
      .mockResolvedValueOnce({ group_by: 'category', totals: [{ key: 'Food', total: 10 }], overall_total: 10 })
      .mockResolvedValueOnce({ group_by: 'month', totals: [{ key: '2026-07', total: 10 }], overall_total: 10 })

    render(<SummaryPanel />)
    await waitFor(() => expect(screen.getByText('Food')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /month/i }))

    await waitFor(() => expect(screen.getByText('2026-07')).toBeInTheDocument())
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ group_by: 'month' }))
  })

  it('shows a zero state with no error when the period has no expenses', async () => {
    vi.spyOn(client, 'getSummary').mockResolvedValue({ group_by: 'category', totals: [], overall_total: 0 })

    render(<SummaryPanel />)

    await waitFor(() => expect(screen.getByText(/no spending in this period/i)).toBeInTheDocument())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an error without unmounting the grouping toggle', async () => {
    vi.spyOn(client, 'getSummary').mockRejectedValue(new client.ApiError('Could not load summary', 500))

    render(<SummaryPanel />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not load summary'))
    expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument()
  })
})
