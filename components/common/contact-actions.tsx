import { Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { buildWhatsAppUrl, TEL_HREF } from "@/lib/contact-links"
import { cn } from "@/lib/utils"

interface ContactActionsProps {
  packageName?: string
  /** Short labels, side by side at every width (first-viewport use). */
  compact?: boolean
  /** Full-width buttons stacked at every width (booking panel). */
  stacked?: boolean
  className?: string
}

export function ContactActions({
  packageName,
  compact = false,
  stacked = false,
  className,
}: ContactActionsProps) {
  const whatsappName = "Ask on WhatsApp"
  const callName = `Call ${siteConfig.contact.phone}`
  const buttonWidth = compact
    ? "flex-1"
    : stacked
      ? "w-full"
      : "w-full sm:w-auto"

  return (
    <div
      className={cn(
        "flex gap-3",
        compact ? "flex-row" : stacked ? "flex-col" : "flex-col sm:flex-row",
        className
      )}
    >
      <Button asChild size="lg" variant="whatsapp" className={buttonWidth}>
        <a
          href={buildWhatsAppUrl({ packageName })}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={compact ? whatsappName : undefined}
        >
          <WhatsappLogo weight="fill" className="size-5" aria-hidden="true" />
          {compact ? "WhatsApp" : whatsappName}
        </a>
      </Button>
      <Button asChild size="lg" variant="outline" className={buttonWidth}>
        <a href={TEL_HREF} aria-label={compact ? callName : undefined}>
          <Phone className="size-5" aria-hidden="true" />
          {compact ? "Call" : callName}
        </a>
      </Button>
    </div>
  )
}
