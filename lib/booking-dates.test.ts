import { describe, expect, it } from "vitest"

import {
  isAcceptableSubmittedDate,
  isSelectableBookingDate,
  SUBMITTED_DATE_GRACE_MS,
} from "./booking-dates"

describe("isSelectableBookingDate", () => {
  const morning = new Date(2026, 8, 29, 10, 30)

  it("allows today (the calendar hands us local midnight)", () => {
    expect(isSelectableBookingDate(new Date(2026, 8, 29), morning)).toBe(true)
  })

  it("allows today late at night", () => {
    const lateNight = new Date(2026, 8, 29, 23, 59)
    expect(isSelectableBookingDate(new Date(2026, 8, 29), lateNight)).toBe(
      true
    )
  })

  it("allows future dates", () => {
    expect(isSelectableBookingDate(new Date(2026, 8, 30), morning)).toBe(true)
  })

  it("rejects yesterday", () => {
    expect(isSelectableBookingDate(new Date(2026, 8, 28), morning)).toBe(false)
  })
})

describe("isAcceptableSubmittedDate", () => {
  it("accepts today for a visitor in Sri Lanka (UTC+05:30)", () => {
    const localMidnight = new Date("2026-09-28T18:30:00.000Z")
    const now = new Date("2026-09-29T04:30:00.000Z")
    expect(isAcceptableSubmittedDate(localMidnight, now)).toBe(true)
  })

  it("accepts today late in the day for a visitor in UTC+14", () => {
    const localMidnight = new Date("2026-09-28T10:00:00.000Z")
    const now = new Date("2026-09-29T09:59:00.000Z")
    expect(isAcceptableSubmittedDate(localMidnight, now)).toBe(true)
  })

  it("accepts today for a visitor in UTC-12", () => {
    const localMidnight = new Date("2026-09-29T12:00:00.000Z")
    const now = new Date("2026-09-30T11:00:00.000Z")
    expect(isAcceptableSubmittedDate(localMidnight, now)).toBe(true)
  })

  it("rejects yesterday for a Sri Lanka visitor in the evening", () => {
    const yesterdayMidnight = new Date("2026-09-27T18:30:00.000Z")
    const now = new Date("2026-09-29T18:00:00.000Z")
    expect(isAcceptableSubmittedDate(yesterdayMidnight, now)).toBe(false)
  })

  it("draws the line at exactly the grace window", () => {
    const now = new Date("2026-09-29T12:00:00.000Z")
    const edge = new Date(now.getTime() - SUBMITTED_DATE_GRACE_MS)
    const past = new Date(edge.getTime() - 1)
    expect(isAcceptableSubmittedDate(edge, now)).toBe(true)
    expect(isAcceptableSubmittedDate(past, now)).toBe(false)
  })
})
