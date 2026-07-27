import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBanner } from './ErrorBanner'

describe('ErrorBanner', () => {
  it('states what failed, in the interface voice, with no apology', () => {
    render(<ErrorBanner message="Could not retrieve expenses" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Could not retrieve expenses')
    expect(alert.textContent?.toLowerCase()).not.toMatch(/sorry|apolog/)
  })
})
