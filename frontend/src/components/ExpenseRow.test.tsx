import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExpenseRow } from './ExpenseRow'
import type { Expense } from '../api/types'

const expense: Expense = {
  id: '1',
  amount: 42.1,
  category: 'Groceries',
  date: '2026-07-24',
  description: 'Ivy Market',
}

describe('ExpenseRow', () => {
  it('renders date, category, description and a right-aligned signed amount', () => {
    render(
      <ul>
        <ExpenseRow expense={expense} />
      </ul>,
    )

    expect(screen.getByText('07.24')).toBeInTheDocument()
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('Ivy Market')).toBeInTheDocument()
    expect(screen.getByText('-42.10')).toBeInTheDocument()
  })
})
