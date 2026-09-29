import type { Metadata } from "next"
import { DM_Serif_Display, Inter } from "next/font/google"

import "./globals.css"

import { JsonLd } from "@/components/seo/json-ld"
import { Toaster } from "@/components/ui/sonner"
import { siteConfig } from "@/config/site"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: "Minneriya & Habarana Jeep Safaris | Ceylon Safari",
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Book private elephant jeep safaris from Habarana to Minneriya, Kaudulla, and Hurulu Eco Park, plus local village and cooking experiences.",
  openGraph: {
    title: "Minneriya & Habarana Jeep Safaris | Ceylon Safari",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Ceylon Safari wildlife and village experiences in Habarana",
      },
    ],
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Minneriya & Habarana Jeep Safaris | Ceylon Safari",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  category: "travel",
  // Only preview directives here: index/follow is the default, and stating it
  // at the root contradicts the noindex Next adds to 404s and pages that opt out.
  robots: {
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "geo.region": "LK-7",
    "geo.placename": siteConfig.contact.addressLocality,
    "geo.position": `${siteConfig.geo.latitude};${siteConfig.geo.longitude}`,
    ICBM: `${siteConfig.geo.latitude}, ${siteConfig.geo.longitude}`,
  },
}

const businessId = `${siteConfig.url}/#business`

const organizationGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TravelAgency",
      "@id": businessId,
      name: siteConfig.name,
      alternateName: siteConfig.formerNames,
      description: siteConfig.description,
      disambiguatingDescription:
        "Ceylon Safari at Anuradhapura Road, Habarana 50150, formerly Travel Habarana Jeep Safari & Village Foods.",
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: new URL(siteConfig.logo, siteConfig.url).toString(),
      },
      image: new URL(siteConfig.ogImage, siteConfig.url).toString(),
      telephone: siteConfig.contact.phoneE164,
      email: siteConfig.contact.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.contact.streetAddress,
        addressLocality: siteConfig.contact.addressLocality,
        postalCode: siteConfig.contact.postalCode,
        addressCountry: siteConfig.contact.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: siteConfig.geo.latitude,
        longitude: siteConfig.geo.longitude,
      },
      hasMap: siteConfig.links.googleMaps,
      openingHours: siteConfig.openingHours,
      areaServed: siteConfig.serviceAreas.map((name) => ({
        "@type": "Place",
        name,
      })),
      contactPoint: {
        "@type": "ContactPoint",
        telephone: siteConfig.contact.phoneE164,
        email: siteConfig.contact.email,
        contactType: "reservations",
        availableLanguage: "English",
      },
      sameAs: [
        siteConfig.links.googleMaps,
        siteConfig.links.facebook,
        siteConfig.links.instagram,
        siteConfig.links.tiktok,
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      alternateName: siteConfig.formerNames,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": businessId },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-LK" suppressHydrationWarning>
      <head>
        <JsonLd data={organizationGraph} />
      </head>
      <body className={`${inter.variable} ${dmSerifDisplay.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
