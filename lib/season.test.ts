import { describe, expect, it } from "vitest"

import { normalizeSeason } from "./season"

describe("normalizeSeason", () => {
  it("returns undefined without usable months", () => {
    expect(normalizeSeason(undefined)).toBeUndefined()
    expect(normalizeSeason(null)).toBeUndefined()
    expect(normalizeSeason({ peak: [], good: [] })).toBeUndefined()
    expect(normalizeSeason({ peak: [0, 13, 8.5], good: [-1] })).toBeUndefined()
  })

  it("drops invalid and duplicate months, sorts, and lets peak win over good", () => {
    expect(normalizeSeason({ peak: [9, 8, 8, 13], good: [8, 7, 7] })).toEqual({
      peak: [8, 9],
      good: [7],
    })
  })

  it("tolerates null arrays from legacy documents", () => {
    expect(normalizeSeason({ peak: null, good: [10] })).toEqual({
      peak: [],
      good: [10],
    })
  })
})
