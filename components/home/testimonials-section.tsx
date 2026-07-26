import Script from "next/script"

import SectionHeading from "@/components/ui/section-heading"

export default function TestimonialsSection() {
  return (
    <section className="px-4 py-20">
      <div className="container mx-auto">
        <SectionHeading
          title="What Our Guests Say"
          subtitle="Read verified feedback from travelers who explored Habarana with our team"
        />
        <Script
          src="https://static.elfsight.com/platform/platform.js"
          strategy="lazyOnload"
        />
        <div
          className="elfsight-app-6c7fd0eb-009c-4af4-b5f0-2669602f0f0b"
          data-elfsight-app-lazy
        />
      </div>
    </section>
  )
}
