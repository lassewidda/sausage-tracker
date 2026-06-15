// Date helpers for the progress timeline.
//
// IMPORTANT timezone trap: the progress grid renders client-side, so any code
// here runs in the *browser's* timezone. Building a Date from a bare
// `'YYYY-MM-DDT00:00:00'` string parses it in LOCAL time, and reading it back
// with `.toISOString()` converts to UTC — which rolls the date back a day for
// any timezone ahead of UTC (e.g. Europe/Stockholm, UTC+2). That shifted the
// whole timeline one day early, so "day 1" looked empty for every Swedish user.
//
// Fix: stay in UTC end-to-end. Parse with a trailing `Z`, increment with
// `setUTCDate`, and format with `toISOString`. The result is a plain calendar
// date list that is identical in every timezone and matches the UTC-bucketed
// exercise data and the UTC `today` string.

/** Inclusive list of calendar dates (YYYY-MM-DD) from `start` to `end`. */
export function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start + 'T00:00:00Z')
  const endDate = new Date(end + 'T00:00:00Z')
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0])
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}
