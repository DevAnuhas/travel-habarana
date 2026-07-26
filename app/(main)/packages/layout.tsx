import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Safari & Village Tour Packages in Habarana",
  description:
    "Compare private Minneriya, Kaudulla, and Hurulu Eco Park jeep safaris from Habarana, plus village and cooking experiences.",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Habarana Safari & Village Tour Packages",
    description:
      "Private jeep safaris and local cultural experiences from Habarana, Sri Lanka.",
    url: "/packages",
  },
}

export default function PackagesPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
