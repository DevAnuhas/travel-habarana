"use client"

import {
  buildSeasonCells,
  cycleMonth,
  MONTH_INITIALS,
  MONTH_LABELS,
  type Season,
} from "@/lib/season"
import { cn } from "@/lib/utils"

const LEVEL_STYLE = {
  off: "border-border bg-background text-muted-foreground",
  good: "border-secondary bg-secondary/40 text-foreground",
  peak: "border-primary bg-primary text-primary-foreground",
} as const

export function SeasonPicker({
  value,
  onChange,
}: {
  value: Season | null | undefined
  onChange: (value: Season | null) => void
}) {
  const cells =
    buildSeasonCells(value) ??
    MONTH_LABELS.map((label, index) => ({
      month: index + 1,
      label,
      initial: MONTH_INITIALS[index],
      level: "off" as const,
    }))

  return (
    <div
      className="grid grid-cols-6 gap-2 sm:grid-cols-12"
      role="group"
      aria-label="Best months"
    >
      {cells.map((cell) => (
        <button
          key={cell.month}
          type="button"
          onClick={() => onChange(cycleMonth(value, cell.month))}
          aria-label={`${cell.label}: ${cell.level === "off" ? "not marked" : cell.level === "peak" ? "best" : "good"}`}
          className={cn(
            "rounded border px-1 py-2 text-xs font-medium",
            LEVEL_STYLE[cell.level]
          )}
        >
          {cell.label}
        </button>
      ))}
    </div>
  )
}
