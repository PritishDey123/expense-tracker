import { useEffect, useRef } from 'react'
import { ExpenseRow } from './ExpenseRow'
import { EmptyState } from './EmptyState'
import { ErrorBanner } from './ErrorBanner'
import type { Expense } from '../api/types'
import './Tape.css'

interface TapeProps {
  items: Expense[]
  loading: boolean
  error: string | null
  hasNext: boolean
  onLoadMore: () => void
}

/** The scrolling right panel: expense entries most-recent-first, or the empty/error state. */
export function Tape({ items, loading, error, hasNext, onLoadMore }: TapeProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasNext) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onLoadMore()
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNext, onLoadMore])

  if (error) return <ErrorBanner message={error} />
  if (!loading && items.length === 0) return <EmptyState />

  return (
    <ul className="tape" aria-label="Expense entries">
      {items.map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} />
      ))}
      <div ref={sentinelRef} aria-hidden="true" />
    </ul>
  )
}
