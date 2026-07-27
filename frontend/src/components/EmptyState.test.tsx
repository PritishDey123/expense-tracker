import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('invites the user to record their first expense', () => {
    render(<EmptyState />)
    expect(screen.getByText(/no expenses yet/i)).toBeInTheDocument()
    expect(screen.getByText(/record your first/i)).toBeInTheDocument()
  })
})
