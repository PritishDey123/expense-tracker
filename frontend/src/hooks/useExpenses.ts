import { useCallback, useEffect, useRef, useState } from 'react'
import { listExpenses, ApiError } from '../api/client'
import type { Expense, ExpenseListParams } from '../api/types'

export interface UseExpensesResult {
  items: Expense[]
  loading: boolean
  error: string | null
  hasNext: boolean
  loadMore: () => Promise<void>
  setItems: React.Dispatch<React.SetStateAction<Expense[]>>
}

const PAGE_SIZE = 20

/** Loads a paginated, filterable expense list. Resets to page 1 whenever the filter params change. */
export function useExpenses(params: Omit<ExpenseListParams, 'page' | 'page_size'>): UseExpensesResult {
  const [items, setItems] = useState<Expense[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listExpenses({ ...params, page: 1, page_size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
        setPage(1)
        setHasNext(res.has_next)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setItems([])
        setError(err instanceof ApiError ? err.message : 'Could not load expenses')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

  const loadingMore = useRef(false)
  const loadMore = useCallback(async () => {
    if (loadingMore.current || !hasNext) return
    loadingMore.current = true
    try {
      const next = page + 1
      const res = await listExpenses({ ...params, page: next, page_size: PAGE_SIZE })
      setItems((prev) => [...prev, ...res.items])
      setPage(next)
      setHasNext(res.has_next)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load more expenses')
    } finally {
      loadingMore.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasNext, paramsKey])

  return { items, loading, error, hasNext, loadMore, setItems }
}
