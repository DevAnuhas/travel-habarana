import SectionHeading from "@/components/ui/section-heading"

import { FAQ_SUBTITLES, getFaqs, type FaqVariant } from "./faq-data"
import { FaqList } from "./faq-list"

// The variant is a prop, not usePathname(): during prerender the pathname did
// not resolve to "/", so the homepage rendered the booking set.
export default function FAQSection({ variant }: { variant: FaqVariant }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle={FAQ_SUBTITLES[variant]}
        />
        <div className="mx-auto mt-12 max-w-3xl">
          <FaqList faqs={getFaqs(variant)} openFirst />
        </div>
      </div>
    </section>
  )
}
