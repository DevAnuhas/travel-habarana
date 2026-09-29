import { describe, expect, it } from "vitest"

import { resolveInitialPackageId } from "./booking-prefill"

const packages = [{ _id: "a".repeat(24) }, { _id: "b".repeat(24) }]

describe("resolveInitialPackageId", () => {
  it("accepts the id of a current package", () => {
    expect(resolveInitialPackageId("b".repeat(24), packages)).toBe(
      "b".repeat(24)
    )
  })

  it.each([
    ["missing", undefined],
    ["malformed", "not-an-id"],
    ["stale id from an old link", "c".repeat(24)],
    ["repeated query param", ["a".repeat(24), "b".repeat(24)]],
  ])("returns empty for %s", (_label, raw) => {
    expect(resolveInitialPackageId(raw, packages)).toBe("")
  })
})
