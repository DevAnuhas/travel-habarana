import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Safari Guides & Habarana Travel Blog",
  description:
    "Plan a better safari with local guides to Minneriya, Kaudulla, Hurulu Eco Park, Habarana village experiences, and Sri Lanka's Cultural Triangle.",
  alternates: { canonical: "/blogs" },
}

export default function BlogsPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
