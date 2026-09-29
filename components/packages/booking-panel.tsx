import Link from "next/link"

import { ContactActions } from "@/components/common/contact-actions"
import type { PublicPackage } from "@/lib/package-serialize"
import { formatPrice, PRICE_ON_REQUEST } from "@/lib/pricing"

/** Desktop only (sticky right column); on mobile the header CTAs and contact bar replace it. */
export function BookingPanel({ pkg }: { pkg: PublicPackage }) {
  const price = formatPrice(pkg)
  return (
    <aside
      aria-label="Book this experience"
      className="grid gap-4 rounded-lg border bg-card p-6 shadow-sm"
    >
      <div className="grid gap-1">
        <p className="text-2xl font-semibold">{price ?? PRICE_ON_REQUEST}</p>
        <p className="text-sm text-muted-foreground">
          {pkg.priceNote ?? "We reply within 24 hours with availability."}
        </p>
      </div>
      <ContactActions packageName={pkg.name} stacked />
      <p className="text-center text-sm text-muted-foreground">
        Prefer email?{" "}
        <Link
          href={`/book-now?packageId=${pkg._id}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Send an inquiry form
        </Link>
      </p>
      <p className="border-t pt-4 text-sm text-muted-foreground">
        No payment needed to ask.
      </p>
    </aside>
  )
}
