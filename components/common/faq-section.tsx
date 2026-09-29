"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import SectionHeading from "@/components/ui/section-heading"

import { FAQ_SUBTITLES, getFaqs, type FaqVariant } from "./faq-data"

// The variant is a prop, not usePathname(): during prerender the pathname did
// not resolve to "/", so the homepage rendered the booking set.
export default function FAQSection({ variant }: { variant: FaqVariant }) {
  const faqs = getFaqs(variant)

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle={FAQ_SUBTITLES[variant]}
        />
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          <Accordion
            type="single"
            defaultValue="item-1"
            collapsible
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <AccordionItem value={`item-${index + 1}`}>
                  <AccordionTrigger className="p-4 font-sans text-sm sm:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  {/* forceMount keeps closed answers in the HTML (Radix marks them hidden). */}
                  <AccordionContent forceMount className="p-4 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
