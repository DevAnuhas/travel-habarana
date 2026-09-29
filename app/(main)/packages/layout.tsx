import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Safari & Village Tour Packages in Habarana",
  description:
    "Compare Minneriya, Kaudulla and Hurulu Eco Park jeep safaris from Habarana, plus village and cooking experiences.",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Habarana Safari & Village Tour Packages",
    description:
      "Jeep safaris and cultural experiences from Habarana, Sri Lanka.",
    url: "/packages",
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

export default function PackagesPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
