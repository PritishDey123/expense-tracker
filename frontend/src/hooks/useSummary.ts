import { useEffect, useState } from 'react'
import { getSummary, ApiError } from '../api/client'
import type { SummaryResponse } from '../api/types'

export interface UseSummaryParams {
  groupBy: 'category' | 'month'
  startDate?: string
  endDate?: string
}

export interface UseSummaryResult {
  data: SummaryResponse | null
  loading: boolean
  error: string | null
}

/** Loads spending totals grouped by category or month; reloads whenever the params change. */
export function useSummary({ groupBy, startDate, endDate }: UseSummaryParams): UseSummaryResult {
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getSummary({ group_by: groupBy, start_date: startDate, end_date: endDate })
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setData(null)
        setError(err instanceof ApiError ? err.message : 'Could not load summary')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [groupBy, startDate, endDate])

  return { data, loading, error }
}
