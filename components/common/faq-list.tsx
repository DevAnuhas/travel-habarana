export interface FaqItem {
  question: string
  answer: string
}

/**
 * Native <details> disclosures: every answer ships in the server HTML, and
 * what the browser shows as open or closed is exactly what it announces.
 */
export function FaqList({
  faqs,
  openFirst = false,
}: {
  faqs: readonly FaqItem[]
  openFirst?: boolean
}) {
  return (
    <div className="grid gap-3">
      {faqs.map((faq, index) => (
        <details
          key={faq.question}
          open={openFirst && index === 0}
          className="rounded-lg border bg-card p-4 open:shadow-sm"
        >
          <summary className="cursor-pointer font-semibold sm:text-lg">
            {faq.question}
          </summary>
          <p className="mt-2 text-muted-foreground">{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}
