export interface Expense {
  id: string
  amount: number
  category: string
  date: string
  description: string
}

export interface ExpenseListResponse {
  items: Expense[]
  page: number
  page_size: number
  total: number
  has_next: boolean
}

export interface SummaryRow {
  key: string
  total: number
}

export interface SummaryResponse {
  group_by: 'category' | 'month'
  totals: SummaryRow[]
  overall_total: number
}

export interface ExpenseListParams {
  page?: number
  page_size?: number
  category?: string
  start_date?: string
  end_date?: string
}

export interface NewExpenseInput {
  amount: number
  category: string
  date: string
  description: string
}

export type ExpenseEditInput = Partial<NewExpenseInput>
