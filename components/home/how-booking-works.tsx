import { ContactActions } from "@/components/common/contact-actions"

// Describes the booking process only; no service claims.
const STEPS = [
  {
    title: "Message us your date and hotel",
    detail: "WhatsApp or call, and tell us how many people are coming.",
  },
  {
    title: "We reply within 24 hours",
    detail:
      "With availability, the time, the current price and pickup details.",
  },
  {
    title: "Confirm and meet your guide",
    detail: "Once it's confirmed, you're set for the day.",
  },
] as const

export function HowBookingWorks() {
  return (
    <section className="px-4 py-16 md:py-20">
      <div className="container mx-auto grid gap-8">
        <h2>How booking works</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-2 border-t-2 border-primary pt-4"
            >
              <span className="font-serif text-3xl text-primary tabular-nums">
                {index + 1}
              </span>
              <h3 className="text-lg">{step.title}</h3>
              <p className="text-muted-foreground">{step.detail}</p>
            </li>
          ))}
        </ol>
        <div className="grid gap-3">
          <p className="font-medium">No payment needed to ask.</p>
          <ContactActions />
        </div>
      </div>
    </section>
  )
}
