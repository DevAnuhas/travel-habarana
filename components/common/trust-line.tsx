import { Star } from "@phosphor-icons/react/dist/ssr"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export function TrustLine({
  tone = "dark",
  className,
}: {
  tone?: "light" | "dark"
  className?: string
}) {
  const { rating, count, source, url } = siteConfig.reviews
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-trust
      className={cn(
        "inline-flex w-fit items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline",
        tone === "light" ? "text-white" : "text-foreground",
        className
      )}
    >
      <Star
        weight="fill"
        className="size-4 text-secondary"
        aria-hidden="true"
      />
      {rating.toFixed(1)} · {count} {source} reviews
    </a>
  )
}
