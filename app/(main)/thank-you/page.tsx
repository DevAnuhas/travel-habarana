import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "@phosphor-icons/react/dist/ssr"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Thank You",
  description:
    "Thank you for your inquiry! Our team will get back to you soon.",
  alternates: { canonical: "/thank-you" },
  robots: { index: false, follow: false },
}

export default function ThankYouPage() {
  return (
    <main className="pt-20">
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="rounded-xl bg-white p-8 shadow-lg md:p-12">
            <div className="mb-6 flex justify-center">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>

            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Thank You!</h1>

            <p className="mb-8 text-lg text-gray-600">
              Your inquiry has been successfully submitted. Our team will get
              back to you within 24 hours with pricing and availability.
            </p>

            <div className="space-y-4">
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>

              <div>
                <p className="my-4 text-sm text-gray-500">
                  If you have any urgent questions, please contact us directly:
                </p>
                <p className="text-sm font-medium">
                  WhatsApp:{" "}
                  <a
                    href={siteConfig.links.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="text-primary hover:underline"
                  >
                    {siteConfig.contact.phone}
                  </a>{" "}
                  <br />
                  Email:{" "}
                  <a
                    href={siteConfig.links.email}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Email"
                    className="text-primary hover:underline"
                  >
                    {siteConfig.contact.email}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
