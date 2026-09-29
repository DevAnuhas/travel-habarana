import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Clock,
  Image as ImageIcon,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr"

import { SeasonStrip } from "@/components/packages/season-strip"
import { buildWhatsAppUrl } from "@/lib/contact-links"
import type { PublicPackage } from "@/lib/package-serialize"
import { formatPrice, PRICE_ON_REQUEST } from "@/lib/pricing"
import { truncateAtWord } from "@/lib/seo"

export default function PackageCard({
  pkg,
  priority = false,
}: {
  pkg: PublicPackage
  priority?: boolean
}) {
  const href = `/packages/${pkg.slug}`
  const price = formatPrice(pkg)
  const cover = pkg.images[0]

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="group block">
        <div className="relative aspect-[4/3] bg-surface-sunken">
          {cover ? (
            <Image
              src={cover}
              alt={pkg.imageAlts?.[cover] ?? pkg.name}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageIcon size={48} aria-hidden="true" />
            </div>
          )}
          <span
            data-fact="duration"
            className="absolute top-3 left-3 inline-flex items-center gap-1 rounded bg-background/90 px-2 py-1 text-xs font-medium"
          >
            <Clock className="size-3.5" aria-hidden="true" />
            {pkg.duration}
          </span>
        </div>
        <div className="grid gap-2 px-5 pt-5">
          <h3 className="text-xl leading-snug group-hover:underline group-hover:underline-offset-4">
            {pkg.name}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {pkg.summary ?? truncateAtWord(pkg.description, 140)}
          </p>
        </div>
      </Link>
      <div className="mt-auto grid gap-4 px-5 pt-4 pb-5">
        {pkg.category === "safari" && (
          <SeasonStrip season={pkg.season} size="sm" />
        )}
        <p
          data-price
          className={price ? "font-semibold" : "text-sm text-muted-foreground"}
        >
          {price ?? PRICE_ON_REQUEST}
        </p>
        <div className="flex items-center justify-between gap-3 text-sm font-medium">
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            View details <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href={buildWhatsAppUrl({ packageName: pkg.name })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ask about ${pkg.name} on WhatsApp`}
            className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
          >
            <WhatsappLogo
              weight="fill"
              className="size-4 text-whatsapp"
              aria-hidden="true"
            />
            Ask
          </a>
        </div>
      </div>
    </article>
  )
}
