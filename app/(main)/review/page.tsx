import type { Metadata } from "next"
import Link from "next/link"
import { Star, ArrowLeft } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Review Us",
  description: `Share your safari experience with ${siteConfig.name} on Google.`,
  alternates: { canonical: "/review" },
  robots: { index: false, follow: false },
}

const GoogleIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

// Star Rating Component
const StarRating = ({ rating = 5 }: { rating?: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        weight="fill"
        className={`h-6 w-6 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))}
  </div>
)

export default function ReviewPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-primary transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Main Content Card */}
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardContent className="p-8 text-center md:p-12">
            <div className="relative z-10 flex flex-col items-center">
              <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Thank You for Your Safari Adventure!
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                We hope you enjoyed your safari! Your honest review helps us
                grow and guides future adventurers. Let us know what made your
                journey memorable.
              </p>

              <div className="mb-8 flex flex-col items-center gap-2">
                <StarRating />
                <p className="text-sm text-gray-500">Rate your experience</p>
              </div>

              {/* Google Review Button */}
              <Link
                href={siteConfig.links.googleReview}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-8 flex items-center gap-3"
              >
                <Button
                  size="lg"
                  className="text-black-900 transform border bg-white px-8 py-6 text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:text-primary hover:shadow-xl"
                >
                  <GoogleIcon />
                  Review us on Google
                </Button>
              </Link>

              {/* Contact Info */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600">
                  Have questions or need assistance?
                  <Link
                    href="/contact"
                    className="ml-1 font-medium text-primary hover:text-primary"
                  >
                    Contact us
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary"
          >
            Explore More Safari Adventures →
          </Link>
        </div>
      </div>
    </div>
  )
}
