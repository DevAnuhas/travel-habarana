import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { inquiryRequestSchema } from "./types"

const inquiry = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+44 7700 900123",
  packageId: "a".repeat(24),
  numberOfPeople: 2,
}

describe("inquiryRequestSchema date rule", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-29T04:30:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("accepts today's date sent from Sri Lanka", () => {
    const result = inquiryRequestSchema.safeParse({
      ...inquiry,
      date: "2026-09-28T18:30:00.000Z",
    })
    expect(result.success).toBe(true)
  })

  it("rejects a date two days in the past", () => {
    const result = inquiryRequestSchema.safeParse({
      ...inquiry,
      date: "2026-09-27T00:00:00.000Z",
    })
    expect(result.success).toBe(false)
  })
})
