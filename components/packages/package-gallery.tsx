import Image from "next/image"
import { Image as ImageIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"

const MOBILE_LIMIT = 8
const DESKTOP_LIMIT = 5

/**
 * Tile spans that exactly fill the 4×2 desktop grid.
 * 2 → lead + tall right half · 3 → lead + two wide tiles · 4 → lead + 2 small + 1 wide · 5 → lead + 4 small.
 */
export function spanFor(index: number, count: number): string {
  if (count <= 1) return ""
  if (index === 0) return "md:col-span-2 md:row-span-2"
  if (count === 2) return "md:col-span-2 md:row-span-2"
  if (count === 3) return "md:col-span-2"
  if (count === 4 && index === count - 1) return "md:col-span-2"
  return ""
}

/**
 * One list of images whose layout changes by breakpoint (swipe strip on
 * mobile, mosaic on desktop), so no image is duplicated and the lead is
 * requested once.
 */
export function PackageGallery({
  images,
  name,
  alts,
}: {
  images: string[]
  name: string
  alts?: Record<string, string>
}) {
  if (images.length === 0) {
    return (
      <div
        role="img"
        aria-label="No photos yet"
        className="flex aspect-[16/9] items-center justify-center rounded-lg bg-surface-sunken text-muted-foreground md:aspect-[21/8]"
      >
        <ImageIcon size={56} aria-hidden="true" />
      </div>
    )
  }

  const shown = images.slice(0, MOBILE_LIMIT)
  const desktopCount = Math.min(images.length, DESKTOP_LIMIT)

  return (
    <div className="relative -mx-4 md:mx-0">
      <ul
        aria-label={`${name} photos`}
        className={cn(
          "flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2",
          "md:grid md:h-[420px] md:snap-none md:overflow-hidden md:rounded-lg md:px-0 md:pb-0",
          desktopCount === 1
            ? "md:grid-cols-1"
            : "md:grid-cols-4 md:grid-rows-2"
        )}
      >
        {shown.map((src, index) => (
          <li
            key={src}
            {...(index === 0 ? { "data-lead-image": "" } : {})}
            className={cn(
              "relative aspect-[16/9] w-[85%] shrink-0 snap-center overflow-hidden rounded-lg bg-surface-sunken",
              "md:aspect-auto md:w-auto md:rounded-none",
              index >= DESKTOP_LIMIT && "md:hidden",
              spanFor(index, desktopCount)
            )}
          >
            <Image
              src={src}
              alt={alts?.[src] ?? `${name}, photo ${index + 1}`}
              fill
              priority={index === 0}
              sizes={
                index === 0
                  ? "(min-width: 768px) 50vw, 85vw"
                  : "(min-width: 768px) 25vw, 85vw"
              }
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      {images.length > 1 && (
        <span className="pointer-events-none absolute top-3 left-7 rounded bg-background/90 px-2 py-1 text-xs font-medium md:hidden">
          {images.length} photos · swipe
        </span>
      )}
    </div>
  )
}
