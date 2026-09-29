export interface Season {
  peak: number[]
  good: number[]
}

type RawSeason =
  { peak?: number[] | null; good?: number[] | null } | null | undefined

const isMonth = (value: number) =>
  Number.isInteger(value) && value >= 1 && value <= 12
const sortedUnique = (values: Iterable<number>) =>
  [...new Set(values)].sort((a, b) => a - b)

/** Clean legacy or hand-edited season data: valid unique months, peak wins over good. */
export function normalizeSeason(season: RawSeason): Season | undefined {
  const peak = sortedUnique((season?.peak ?? []).filter(isMonth))
  const good = sortedUnique(
    (season?.good ?? []).filter((m) => isMonth(m) && !peak.includes(m))
  )
  return peak.length || good.length ? { peak, good } : undefined
}

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const
export const MONTH_INITIALS = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
] as const

export type SeasonLevel = "peak" | "good" | "off"

export interface SeasonCell {
  month: number
  label: string
  initial: string
  level: SeasonLevel
}

export function buildSeasonCells(season?: Season | null): SeasonCell[] | null {
  const clean = normalizeSeason(season)
  if (!clean) return null
  return MONTH_LABELS.map((label, index) => {
    const month = index + 1
    const level: SeasonLevel = clean.peak.includes(month)
      ? "peak"
      : clean.good.includes(month)
        ? "good"
        : "off"
    return { month, label, initial: MONTH_INITIALS[index], level }
  })
}

/** Admin picker: off → good → peak → off. Returns null when nothing is marked. */
export function cycleMonth(
  season: Season | null | undefined,
  month: number
): Season | null {
  const clean = normalizeSeason(season) ?? { peak: [], good: [] }
  const peak = new Set(clean.peak)
  const good = new Set(clean.good)
  if (peak.has(month)) peak.delete(month)
  else if (good.has(month)) {
    good.delete(month)
    peak.add(month)
  } else good.add(month)
  return normalizeSeason({ peak: [...peak], good: [...good] }) ?? null
}

function describeRuns(months: number[]): string {
  const runs: string[] = []
  let start = months[0]
  for (let i = 1; i <= months.length; i++) {
    if (months[i] !== months[i - 1] + 1) {
      const end = months[i - 1]
      runs.push(
        start === end
          ? MONTH_LABELS[start - 1]
          : `${MONTH_LABELS[start - 1]}–${MONTH_LABELS[end - 1]}`
      )
      start = months[i]
    }
  }
  return runs.join(", ")
}

export function describeSeason(season?: Season | null): string | null {
  const clean = normalizeSeason(season)
  if (!clean) return null
  const parts: string[] = []
  if (clean.peak.length) parts.push(`Best: ${describeRuns(clean.peak)}.`)
  if (clean.good.length) parts.push(`Good: ${describeRuns(clean.good)}.`)
  return parts.join(" ")
}
