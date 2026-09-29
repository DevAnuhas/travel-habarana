import { siteConfig } from "@/config/site"

const WHATSAPP_NUMBER = siteConfig.contact.phoneE164.replace(/^\+/, "")

export const TEL_HREF = `tel:${siteConfig.contact.phoneE164}`

export function buildWhatsAppUrl({
  packageName,
}: { packageName?: string } = {}): string {
  const name = packageName?.trim()
  const subject = name
    ? `I'd like to check availability for "${name}".`
    : "I'd like to ask about a safari."
  const text = [
    `Hi ${siteConfig.name}! ${subject}`,
    "Date: ",
    "People: ",
    "Pickup hotel: ",
  ].join("\n")
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
