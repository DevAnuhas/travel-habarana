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

import { buildSeasonCells, cycleMonth, describeSeason } from "./season"

describe("buildSeasonCells", () => {
  it("returns null without usable data", () => {
    expect(buildSeasonCells(undefined)).toBeNull()
    expect(buildSeasonCells({ peak: [0, 13], good: [] })).toBeNull()
  })

  it("marks 12 months, peak winning over good", () => {
    const cells = buildSeasonCells({ peak: [8, 9], good: [7, 10, 8] })!
    expect(cells).toHaveLength(12)
    expect(cells.map((c) => c.level).join(",")).toBe(
      "off,off,off,off,off,off,good,peak,peak,good,off,off"
    )
    expect(cells[0]).toMatchObject({ month: 1, label: "Jan", initial: "J" })
  })
})

describe("cycleMonth", () => {
  it("cycles off → good → peak → off", () => {
    const once = cycleMonth(null, 8)
    expect(once).toEqual({ peak: [], good: [8] })
    const twice = cycleMonth(once, 8)
    expect(twice).toEqual({ peak: [8], good: [] })
    expect(cycleMonth(twice, 8)).toBeNull()
  })

  it("keeps months sorted", () => {
    expect(cycleMonth({ peak: [], good: [9] }, 7)).toEqual({
      peak: [],
      good: [7, 9],
    })
  })
})

describe("describeSeason", () => {
  it("summarises runs of months", () => {
    expect(describeSeason({ peak: [7, 8, 9], good: [6, 10, 12] })).toBe(
      "Best: Jul–Sep. Good: Jun, Oct, Dec."
    )
  })

  it("returns null without data", () => {
    expect(describeSeason(undefined)).toBeNull()
  })
})
