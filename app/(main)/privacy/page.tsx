import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects inquiry and website information.`,
  alternates: { canonical: "/privacy" },
}

const sections = [
  {
    title: "Information we collect",
    content: (
      <>
        <p>
          When you send a booking inquiry, we collect the name, email address,
          phone number, preferred package and date, group size, and any message
          you choose to provide. Public blog comments collect the display name
          and comment text you submit.
        </p>
        <p>
          We also process limited technical information needed to deliver and
          protect the site, such as request logs and rate-limit identifiers. The
          public website does not collect card payments, passport details, or
          government identification.
        </p>
      </>
    ),
  },
  {
    title: "How we use information",
    content: (
      <p>
        We use submitted information to answer inquiries, confirm availability,
        plan requested experiences, send service emails, moderate comments,
        maintain site security, and meet legal obligations that apply to our
        operations. We do not sell personal information.
      </p>
    ),
  },
  {
    title: "Service providers",
    content: (
      <p>
        We use service providers to host the website, store inquiry and content
        data, deliver email, manage images, and display review widgets. These
        currently include Vercel, MongoDB, Sanity, Cloudinary, our email
        provider, and Elfsight. They process information under their own
        security and privacy terms.
      </p>
    ),
  },
  {
    title: "Cookies",
    content: (
      <p>
        Administrative sign-in uses an authentication cookie. Embedded review
        or social services may use their own cookies or similar technologies
        when loaded.
      </p>
    ),
  },
  {
    title: "Retention and security",
    content: (
      <p>
        We retain information only as long as it is reasonably needed for the
        purposes above, dispute handling, security, and applicable
        recordkeeping. We use access controls, input validation, encryption in
        transit, and other reasonable safeguards, but no online system can be
        guaranteed perfectly secure.
      </p>
    ),
  },
  {
    title: "Your choices",
    content: (
      <p>
        You may ask us to access, correct, or delete personal information we
        hold, subject to any records we must retain. You may also withdraw a
        pending inquiry or ask us not to contact you further.
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: July 26, 2026</p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="space-y-8 p-8">
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">Introduction</h2>
              <p className="leading-relaxed text-gray-700">
                This notice explains how {siteConfig.name} handles information
                when you use this website, contact us, submit a tour inquiry, or
                leave a blog comment.
              </p>
            </section>

            {sections.map((section) => (
              <div key={section.title}>
                <Separator className="mb-8" />
                <section className="space-y-3">
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                  <div className="space-y-3 leading-relaxed text-gray-700">
                    {section.content}
                  </div>
                </section>
              </div>
            ))}

            <Separator />
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">Contact us</h2>
              <p className="leading-relaxed text-gray-700">
                Email{" "}
                <a
                  href={siteConfig.links.email}
                  className="text-primary hover:underline"
                >
                  {siteConfig.contact.email}
                </a>{" "}
                or write to {siteConfig.contact.address}.
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
