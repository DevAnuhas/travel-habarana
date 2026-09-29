const HOUR_MS = 60 * 60 * 1000

/**
 * A visitor's "today" begins at their local midnight, which is always less
 * than 24 hours before the current instant in every time zone. The extra hour
 * absorbs client/server clock skew; the cost is that "yesterday" is still
 * accepted for the first hour after local midnight, which is harmless for an
 * inquiry.
 */
export const SUBMITTED_DATE_GRACE_MS = 25 * HOUR_MS

/** Calendar rule, evaluated in the visitor's own time zone. */
export function isSelectableBookingDate(candidate: Date, now: Date): boolean {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  return candidate.getTime() >= startOfToday.getTime()
}

/** Server rule: the server cannot know the visitor's zone, only the instant. */
export function isAcceptableSubmittedDate(submitted: Date, now: Date): boolean {
  return submitted.getTime() >= now.getTime() - SUBMITTED_DATE_GRACE_MS
}
