import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Contact Our Habarana Safari Team",
  description: `Contact ${siteConfig.name} on WhatsApp, phone, or email for Minneriya, Kaudulla, Hurulu, and Habarana village tour inquiries.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact ${siteConfig.name}`,
    description: `Plan a private Habarana safari or village experience with our local team.`,
    url: "/contact",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Ceylon Safari wildlife and village experiences in Habarana",
      },
    ],
  },
}

export default function ContactPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
