import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSummary } from './useSummary'
import * as client from '../api/client'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useSummary', () => {
  it('loads category totals on mount', async () => {
    vi.spyOn(client, 'getSummary').mockResolvedValue({
      group_by: 'category',
      totals: [{ key: 'Food', total: 10 }],
      overall_total: 10,
    })

    const { result } = renderHook(() => useSummary({ groupBy: 'category' }))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data?.totals).toEqual([{ key: 'Food', total: 10 }])
    expect(result.current.error).toBeNull()
  })

  it('reloads when groupBy changes', async () => {
    const spy = vi
      .spyOn(client, 'getSummary')
      .mockResolvedValueOnce({ group_by: 'category', totals: [], overall_total: 0 })
      .mockResolvedValueOnce({ group_by: 'month', totals: [{ key: '2026-07', total: 5 }], overall_total: 5 })

    const { result, rerender } = renderHook(({ groupBy }) => useSummary({ groupBy }), {
      initialProps: { groupBy: 'category' as 'category' | 'month' },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    rerender({ groupBy: 'month' })
    await waitFor(() => expect(result.current.data?.group_by).toBe('month'))

    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ group_by: 'month' }))
  })

  it('surfaces an error without throwing', async () => {
    vi.spyOn(client, 'getSummary').mockRejectedValue(new client.ApiError('Could not load summary', 500))

    const { result } = renderHook(() => useSummary({ groupBy: 'category' }))

    await waitFor(() => expect(result.current.error).toBe('Could not load summary'))
    expect(result.current.data).toBeNull()
  })
})
