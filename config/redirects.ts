export interface PermanentRedirect {
  source: string
  destination: string
  permanent: true
}

const to = (source: string, destination: string): PermanentRedirect => ({
  source,
  destination,
  permanent: true,
})

// Consolidates duplicate or removed content onto one canonical page each.
// The travelhabarana.com host rules were removed on 29 Sep 2026: the client
// will not re-register that domain, so they could never match again.
export const contentRedirects: PermanentRedirect[] = [
  ...[
    "habarana-safari-jeep",
    "habarana-elephant-jeep-safari",
    "habaranaelephantjeepsafari",
  ].map((slug) => to(`/blogs/${slug}`, "/blogs/habarana-jeep-safari")),
  to(
    "/blogs/minneriya-national-park-jeep-safari",
    "/blogs/minneriya-jeep-safari"
  ),
  to("/blogs/minneriya-jeep-safari-habarana", "/blogs/minneriya-jeep-safari"),
  to(
    "/packages/habarana-safari-tour-minneriya-and-kaudulla-nationalpark",
    "/packages/minneriya-national-park-safari"
  ),
  to(
    "/packages/explore-sri-lanka-a-complete-guide-to-every-city-tour",
    "/packages/srilankan-day-and-multi-day-tours"
  ),
]
