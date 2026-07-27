import type {
  Expense,
  ExpenseListParams,
  ExpenseListResponse,
  ExpenseEditInput,
  NewExpenseInput,
  SummaryResponse,
} from './types'

/** Raised when the API responds with a non-2xx status. Carries the server's own error message. */
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json()
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg
  } catch {
    /* fall through to generic message */
  }
  return `Request failed with status ${res.status}`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new ApiError(await parseErrorDetail(res), res.status)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function toQueryString(params: object): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params) as [string, string | number | undefined][]) {
    if (value !== undefined) search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

/**
 * Fetches one page of expenses, most-recently-created first.
 * @throws ApiError with the server's `detail` message (e.g. invalid date range) on failure.
 */
export function listExpenses(params: ExpenseListParams): Promise<ExpenseListResponse> {
  return request(`/expenses${toQueryString(params)}`)
}

/**
 * Records a new expense.
 * @throws ApiError with the Pydantic validation message on a 422.
 */
export function createExpense(input: NewExpenseInput): Promise<Expense> {
  return request('/expenses', { method: 'POST', body: JSON.stringify(input) })
}

/**
 * Applies a partial update — only the fields present in `changes` are sent.
 * @throws ApiError with "Expense not found" (404) or a validation message (422).
 */
export function editExpense(id: string, changes: ExpenseEditInput): Promise<Expense> {
  return request(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
}

/**
 * Permanently deletes an expense. There is no undo.
 * @throws ApiError with "Expense not found" (404) if the id doesn't exist.
 */
export function deleteExpense(id: string): Promise<void> {
  return request(`/expenses/${id}`, { method: 'DELETE' })
}

/**
 * Fetches spending totals grouped by category or by month.
 * @throws ApiError if `group_by` is invalid or the date range is inverted (422).
 */
export function getSummary(params: {
  group_by: 'category' | 'month'
  start_date?: string
  end_date?: string
}): Promise<SummaryResponse> {
  return request(`/expenses/summary${toQueryString(params)}`)
}
