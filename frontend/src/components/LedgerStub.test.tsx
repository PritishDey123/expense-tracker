import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LedgerStub } from './LedgerStub'
import type { Expense } from '../api/types'

describe('LedgerStub', () => {
  it('shows the sum of loaded expenses in the current month', () => {
    const items: Expense[] = [
      { id: '1', amount: 42.1, category: 'Groceries', date: '2026-07-24', description: 'a' },
      { id: '2', amount: 2.9, category: 'Transit', date: '2026-07-23', description: 'b' },
      { id: '3', amount: 100, category: 'Rent', date: '2026-06-01', description: 'c' },
    ]

    render(<LedgerStub items={items} now={new Date('2026-07-27T00:00:00Z')} />)

    expect(screen.getByText('45.00')).toBeInTheDocument()
    expect(screen.getByText(/this month/i)).toBeInTheDocument()
  })

  it('shows zero when there are no expenses this month', () => {
    render(<LedgerStub items={[]} now={new Date('2026-07-27T00:00:00Z')} />)
    expect(screen.getByText('0.00')).toBeInTheDocument()
  })
})
