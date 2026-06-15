import { expect, test } from 'bun:test'
import { generateDateRange } from './progressDates'

// Regression test for the progress-grid off-by-one. Run under a UTC+ timezone
// (e.g. `TZ=Europe/Stockholm bun test`) to catch the original bug, where the
// first day rendered as the day *before* the configured start date.

test('first and last day match the configured range', () => {
  const range = generateDateRange('2026-04-13', '2026-06-14')
  expect(range[0]).toBe('2026-04-13')
  expect(range[range.length - 1]).toBe('2026-06-14')
})

test('range length is inclusive', () => {
  // Apr 13 .. Jun 14 inclusive = 63 days
  expect(generateDateRange('2026-04-13', '2026-06-14')).toHaveLength(63)
})

test('single-day range', () => {
  expect(generateDateRange('2026-04-13', '2026-04-13')).toEqual(['2026-04-13'])
})

test('crosses a month boundary correctly', () => {
  expect(generateDateRange('2026-04-29', '2026-05-02')).toEqual([
    '2026-04-29',
    '2026-04-30',
    '2026-05-01',
    '2026-05-02',
  ])
})
