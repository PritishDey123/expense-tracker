import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterControls } from './FilterControls'

const empty = { category: '', startDate: '', endDate: '' }

describe('FilterControls', () => {
  it('applies a category filter as it is typed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterControls filters={empty} onChange={onChange} />)

    await user.type(screen.getByLabelText(/filter by category/i), 'Food')

    expect(onChange).toHaveBeenLastCalledWith({ category: 'Food', startDate: '', endDate: '' })
  })

  it('applies a valid inclusive date range', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterControls filters={empty} onChange={onChange} />)

    await user.type(screen.getByLabelText(/from/i), '2026-07-01')
    await user.type(screen.getByLabelText(/to/i), '2026-07-31')

    expect(onChange).toHaveBeenLastCalledWith({ category: '', startDate: '2026-07-01', endDate: '2026-07-31' })
  })

  it('shows a validation error and does not apply when start is after end', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterControls filters={empty} onChange={onChange} />)

    await user.type(screen.getByLabelText(/from/i), '2026-07-31')
    onChange.mockClear()
    await user.type(screen.getByLabelText(/to/i), '2026-07-01')

    expect(screen.getByText(/start date must not be after end date/i)).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows a stamp-gold chip for each active filter', () => {
    render(
      <FilterControls
        filters={{ category: 'Food', startDate: '2026-07-01', endDate: '' }}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Food')).toHaveClass('filter-chip')
    expect(screen.getByText(/from 2026-07-01/i)).toHaveClass('filter-chip')
  })

  it('clears all filters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterControls filters={{ category: 'Food', startDate: '2026-07-01', endDate: '' }} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(onChange).toHaveBeenCalledWith(empty)
  })
})
