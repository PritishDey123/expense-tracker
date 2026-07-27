import { describe, it, expect } from 'vitest'
import { formatAmount, formatDate, isInMonth, currentMonthKey } from './format'

describe('formatAmount', () => {
  it('renders two decimals with a leading minus for expenses', () => {
    expect(formatAmount(42.1)).toBe('-42.10')
  })

  it('rounds to two decimals', () => {
    expect(formatAmount(2.999)).toBe('-3.00')
  })
})

describe('formatDate', () => {
  it('renders MM.DD from an ISO date string', () => {
    expect(formatDate('2026-07-24')).toBe('07.24')
  })
})

describe('isInMonth', () => {
  it('is true when the date shares the given YYYY-MM key', () => {
    expect(isInMonth('2026-07-24', '2026-07')).toBe(true)
  })

  it('is false for a different month', () => {
    expect(isInMonth('2026-06-30', '2026-07')).toBe(false)
  })
})

describe('currentMonthKey', () => {
  it('formats a Date as YYYY-MM', () => {
    expect(currentMonthKey(new Date('2026-07-24T12:00:00Z'))).toBe('2026-07')
  })
})
