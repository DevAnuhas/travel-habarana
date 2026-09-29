import { ContactActions } from "@/components/common/contact-actions"

export function FinalCta({
  title = "Planning your trip to Habarana?",
  packageName,
}: {
  title?: string
  packageName?: string
}) {
  return (
    <section className="bg-primary px-4 py-16 text-primary-foreground">
      <div className="container mx-auto grid max-w-3xl justify-items-center gap-5 text-center">
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        <p className="max-w-xl text-primary-foreground/85">
          Send us your date and hotel. We&apos;ll reply within 24 hours with
          availability and the current price. No payment needed to ask.
        </p>
        <ContactActions packageName={packageName} className="justify-center" />
      </div>
    </section>
  )
}
