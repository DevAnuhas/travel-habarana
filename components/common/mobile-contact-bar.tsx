import { Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr"

import { buttonVariants } from "@/components/ui/button"
import { buildWhatsAppUrl, TEL_HREF } from "@/lib/contact-links"
import { formatPrice, PRICE_ON_REQUEST, type PriceFields } from "@/lib/pricing"
import { cn } from "@/lib/utils"

/**
 * Sticky, not fixed: as the last child of <main> it rides the viewport bottom
 * while scrolling and settles into its own space above the footer at the end,
 * so it can never cover the footer or the last content, whatever its height.
 */
export function MobileContactBar({
  packageName,
  price,
}: {
  packageName?: string
  price?: PriceFields
}) {
  const priceLabel = price ? (formatPrice(price) ?? PRICE_ON_REQUEST) : null

  return (
    <div
      data-contact-bar
      className="sticky bottom-0 z-40 border-t bg-background/95 px-4 pt-3 backdrop-blur lg:hidden"
      style={{
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex items-center gap-3">
        {priceLabel && (
          <p
            data-price
            className="min-w-0 flex-1 text-sm leading-tight font-semibold"
          >
            {priceLabel}
          </p>
        )}
        <a
          href={buildWhatsAppUrl({ packageName })}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "whatsapp", size: "lg" }),
            priceLabel ? "px-5" : "flex-1"
          )}
        >
          <WhatsappLogo weight="fill" className="size-5" aria-hidden="true" />
          WhatsApp
        </a>
        <a
          href={TEL_HREF}
          aria-label="Call us"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "px-4"
          )}
        >
          <Phone className="size-5" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
