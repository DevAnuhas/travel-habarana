export interface Season {
  peak: number[]
  good: number[]
}

type RawSeason =
  | { peak?: number[] | null; good?: number[] | null }
  | null
  | undefined

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
