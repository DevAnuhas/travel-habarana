import type { NextConfig } from "next"
import { siteConfig } from "./config/site"

const isDevelopment = process.env.NODE_ENV === "development"

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://static.elfsight.com https://*.sanity.io`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://cdn.sanity.io https://*.elfsight.com https://*.elfsightcdn.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://api.cloudinary.com https://*.elfsight.com https://*.elfsightcdn.com",
  "frame-src 'self' https://*.sanity.io https://*.elfsight.com https://www.google.com https://maps.google.com",
  "media-src 'self' blob: https://cdn.sanity.io https://res.cloudinary.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ")

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    content: {
      stale: 300,
      revalidate: 3600,
      expire: 604800,
    },
  },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      ...[
        "habarana-safari-jeep",
        "habarana-elephant-jeep-safari",
        "habaranaelephantjeepsafari",
      ].map((slug) => ({
        source: `/blogs/${slug}`,
        destination: "/blogs/habarana-jeep-safari",
        permanent: true,
      })),
      {
        source: "/:path*",
        has: [{ type: "host", value: "travelhabarana.com" }],
        destination: `${siteConfig.url}/:path*`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.travelhabarana.com" }],
        destination: `${siteConfig.url}/:path*`,
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ]
  },
}

export default nextConfig
