import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useExpenses } from './useExpenses'
import * as client from '../api/client'
import type { Expense } from '../api/types'

function page(items: Expense[], page: number, hasNext: boolean) {
  return { items, page, page_size: 2, total: 5, has_next: hasNext }
}

const A: Expense = { id: '1', amount: 10, category: 'Food', date: '2026-07-24', description: 'a' }
const B: Expense = { id: '2', amount: 20, category: 'Transit', date: '2026-07-23', description: 'b' }
const C: Expense = { id: '3', amount: 30, category: 'Food', date: '2026-06-01', description: 'c' }

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useExpenses', () => {
  it('loads the first page on mount', async () => {
    vi.spyOn(client, 'listExpenses').mockResolvedValue(page([A, B], 1, true))

    const { result } = renderHook(() => useExpenses({}))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toEqual([A, B])
    expect(result.current.error).toBeNull()
    expect(result.current.hasNext).toBe(true)
  })

  it('appends the next page without duplicates when loadMore is called', async () => {
    vi.spyOn(client, 'listExpenses')
      .mockResolvedValueOnce(page([A, B], 1, true))
      .mockResolvedValueOnce(page([C], 2, false))

    const { result } = renderHook(() => useExpenses({}))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.loadMore()
    })

    expect(result.current.items).toEqual([A, B, C])
    expect(result.current.hasNext).toBe(false)
  })

  it('surfaces an error and keeps items empty when the request fails', async () => {
    vi.spyOn(client, 'listExpenses').mockRejectedValue(new client.ApiError('Could not retrieve expenses', 500))

    const { result } = renderHook(() => useExpenses({}))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Could not retrieve expenses')
    expect(result.current.items).toEqual([])
  })

  it('resets and reloads from page 1 when filter params change', async () => {
    const spy = vi
      .spyOn(client, 'listExpenses')
      .mockResolvedValueOnce(page([A, B], 1, false))
      .mockResolvedValueOnce(page([C], 1, false))

    const { result, rerender } = renderHook(({ category }) => useExpenses({ category }), {
      initialProps: { category: undefined as string | undefined },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    rerender({ category: 'Food' })
    await waitFor(() => expect(result.current.items).toEqual([C]))

    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, category: 'Food' }))
  })
})
