import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

import { ContactActions } from "@/components/common/contact-actions"
import { TrustLine } from "@/components/common/trust-line"
import { imagery } from "@/config/imagery"
import type { PublicPackage } from "@/lib/package-serialize"
import { formatPrice, PRICE_ON_REQUEST } from "@/lib/pricing"

// Content-sized (no viewport height) so the first phone viewport holds the
// decision facts: what, duration, price, trust and WhatsApp for each safari.
export default function HeroSection({ safaris }: { safaris: PublicPackage[] }) {
  return (
    <section className="relative isolate overflow-hidden px-4 pt-24 pb-8 md:pt-32 md:pb-16">
      <Image
        src={imagery.hero.src}
        alt={imagery.hero.alt}
        fill
        priority
        data-lead-image
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/55 to-black/75"
        aria-hidden="true"
      />
      <div className="container mx-auto">
        <div className="grid max-w-2xl gap-4 text-white">
          <p className="text-sm font-medium tracking-wide text-white/85 uppercase">
            Minneriya · Kaudulla · Hurulu Eco Park
          </p>
          <h1>Jeep safaris from Habarana</h1>
          <TrustLine tone="light" />
          <ContactActions
            compact
            className="max-w-md [&_a:last-child]:border-white/60 [&_a:last-child]:bg-transparent [&_a:last-child]:text-white"
          />
          {safaris.length > 0 && (
            <ul className="grid max-w-md gap-1.5" aria-label="Safaris">
              {safaris.map((pkg) => (
                <li key={pkg._id} data-quick-pick>
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="flex items-center gap-3 rounded bg-black/35 px-3 py-2 backdrop-blur-sm hover:bg-black/50"
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        data-qp-name
                        className="block leading-snug font-semibold"
                      >
                        {pkg.name}
                      </span>
                      <span className="block text-sm text-white/85">
                        <span data-fact="duration">{pkg.duration}</span> ·{" "}
                        <span data-price>
                          {formatPrice(pkg) ?? PRICE_ON_REQUEST}
                        </span>
                      </span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="max-w-xl text-white/90">
            Message us your date and hotel. We&apos;ll reply within 24 hours
            with the park, the time and the current price.
          </p>
        </div>
      </div>
    </section>
  )
}
