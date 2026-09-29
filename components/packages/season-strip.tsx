import { buildSeasonCells, describeSeason, type Season } from "@/lib/season"
import { cn } from "@/lib/utils"

const LEVEL = {
  peak: "bg-primary text-primary-foreground",
  good: "bg-secondary text-secondary-foreground",
  off: "bg-surface-sunken text-muted-foreground",
} as const

// Unmarked months get no judgement ("quiet", "low season"): the admin only
// tells us which months are good or best, nothing about the rest.
const TITLE = {
  peak: (month: string) => `${month}: best`,
  good: (month: string) => `${month}: good`,
  off: (month: string) => month,
}

export function SeasonStrip({
  season,
  size = "md",
  className,
}: {
  season?: Season
  size?: "sm" | "md"
  className?: string
}) {
  const cells = buildSeasonCells(season)
  const summary = describeSeason(season)
  if (!cells || !summary) return null

  return (
    <div className={cn("grid gap-2", className)}>
      <div
        role="img"
        aria-label={summary}
        className="grid grid-cols-12 gap-0.5"
      >
        {cells.map((cell) => (
          <span
            key={cell.month}
            data-level={cell.level}
            title={TITLE[cell.level](cell.label)}
            className={cn(
              "flex items-center justify-center font-medium tabular-nums",
              size === "sm" ? "h-5 text-[10px]" : "h-8 text-xs",
              LEVEL[cell.level]
            )}
          >
            {cell.initial}
          </span>
        ))}
      </div>
      {size === "md" && (
        <p className="text-sm text-muted-foreground">{summary}</p>
      )}
    </div>
  )
}
