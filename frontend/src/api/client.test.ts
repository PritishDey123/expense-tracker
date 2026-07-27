import { describe, it, expect, vi, afterEach } from 'vitest'
import { listExpenses, createExpense, editExpense, deleteExpense, getSummary, ApiError } from './client'

const jsonResponse = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )

afterEach(() => {
  vi.restoreAllMocks()
})

describe('listExpenses', () => {
  it('builds the query string from provided params and returns parsed items', async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockReturnValue(
      jsonResponse({ items: [], page: 1, page_size: 20, total: 0, has_next: false }),
    )

    await listExpenses({ page: 2, category: 'Groceries', start_date: '2026-07-01' })

    const calledUrl = fetchSpy.mock.calls[0][0] as string
    expect(calledUrl).toContain('/expenses?')
    expect(calledUrl).toContain('page=2')
    expect(calledUrl).toContain('category=Groceries')
    expect(calledUrl).toContain('start_date=2026-07-01')
  })

  it('throws ApiError with the server detail message on failure', async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      jsonResponse({ detail: 'Could not retrieve expenses' }, 500),
    )

    await expect(listExpenses({})).rejects.toThrow(ApiError)
    await expect(listExpenses({})).rejects.toThrow('Could not retrieve expenses')
  })
})

describe('createExpense', () => {
  it('posts the payload and returns the created expense', async () => {
    const created = { id: '1', amount: 10, category: 'Food', date: '2026-07-01', description: 'x' }
    vi.spyOn(globalThis, "fetch").mockReturnValue(jsonResponse(created, 201))

    const result = await createExpense({ amount: 10, category: 'Food', date: '2026-07-01', description: 'x' })
    expect(result).toEqual(created)
  })

  it('throws ApiError on validation failure', async () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(
      jsonResponse({ detail: [{ loc: ['body', 'amount'], msg: 'must be > 0', type: 'value_error' }] }, 422),
    )

    await expect(
      createExpense({ amount: 0, category: 'Food', date: '2026-07-01', description: 'x' }),
    ).rejects.toThrow(ApiError)
  })
})

describe('editExpense', () => {
  it('patches only the provided fields', async () => {
    const updated = { id: '1', amount: 60, category: 'Food', date: '2026-07-01', description: 'x' }
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockReturnValue(jsonResponse(updated))

    const result = await editExpense('1', { amount: 60 })

    expect(result).toEqual(updated)
    const init = fetchSpy.mock.calls[0][1] as RequestInit
    expect(init.method).toBe('PATCH')
    expect(init.body).toBe(JSON.stringify({ amount: 60 }))
  })

  it('throws ApiError with 404 detail when the expense is missing', async () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(jsonResponse({ detail: 'Expense not found' }, 404))
    await expect(editExpense('missing', { amount: 5 })).rejects.toThrow('Expense not found')
  })
})

describe('deleteExpense', () => {
  it('resolves with no value on 204', async () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(
      Promise.resolve(new Response(null, { status: 204 })),
    )
    await expect(deleteExpense('1')).resolves.toBeUndefined()
  })

  it('throws ApiError when the expense is missing', async () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(jsonResponse({ detail: 'Expense not found' }, 404))
    await expect(deleteExpense('missing')).rejects.toThrow('Expense not found')
  })
})

describe('getSummary', () => {
  it('requires group_by and returns totals', async () => {
    const body = { group_by: 'category', totals: [{ key: 'Food', total: 10 }], overall_total: 10 }
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockReturnValue(jsonResponse(body))

    const result = await getSummary({ group_by: 'category' })

    expect(result).toEqual(body)
    expect(fetchSpy.mock.calls[0][0] as string).toContain('group_by=category')
  })
})
