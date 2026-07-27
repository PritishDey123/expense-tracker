import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Tape } from './Tape'
import type { Expense } from '../api/types'

const A: Expense = { id: '1', amount: 10, category: 'Food', date: '2026-07-24', description: 'a' }

let observed: IntersectionObserverCallback | null = null

beforeEach(() => {
  observed = null
  class FakeObserver {
    constructor(cb: IntersectionObserverCallback) {
      observed = cb
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', FakeObserver)
})

describe('Tape', () => {
  it('renders rows most-recent-first as given by items order', () => {
    render(<Tape items={[A]} loading={false} error={null} hasNext={false} onLoadMore={vi.fn()} onEditSave={vi.fn()} />)
    expect(screen.getByText('Food')).toBeInTheDocument()
  })

  it('shows the empty state when there are no items and no error', () => {
    render(<Tape items={[]} loading={false} error={null} hasNext={false} onLoadMore={vi.fn()} onEditSave={vi.fn()} />)
    expect(screen.getByText(/no expenses yet/i)).toBeInTheDocument()
  })

  it('shows an error banner and no rows when loading failed', () => {
    render(<Tape items={[]} loading={false} error="Could not retrieve expenses" hasNext={false} onLoadMore={vi.fn()} onEditSave={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Could not retrieve expenses')
    expect(screen.queryByText(/no expenses yet/i)).not.toBeInTheDocument()
  })

  it('calls onLoadMore when the sentinel intersects and more pages exist', () => {
    const onLoadMore = vi.fn()
    render(<Tape items={[A]} loading={false} error={null} hasNext={true} onLoadMore={onLoadMore} onEditSave={vi.fn()} />)

    observed?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(onLoadMore).toHaveBeenCalled()
  })
})
