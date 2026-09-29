export type FaqVariant = "safari" | "booking"

export interface Faq {
  question: string
  answer: string
}

const safariFAQs: readonly Faq[] = [
  {
    question: "What is the best time for wildlife viewing?",
    answer:
      "The best time for wildlife safaris in Habarana is from May to October when water levels are low and animals gather around water holes. The famous Elephant Gathering peaks between July and September.",
  },
  {
    question: "Are your tours suitable for families with children?",
    answer:
      "Yes! Our tours are family-friendly and we can customize the experience based on the ages of your children. We provide extra safety measures and engaging activities for young wildlife enthusiasts.",
  },
  {
    question: "What should I bring for a safari?",
    answer:
      "We recommend bringing sunscreen, a hat, sunglasses, comfortable clothing, a camera, and binoculars if you have them. Water bottles and snacks are provided on all our safaris.",
  },
  {
    question: "How many people can fit in one safari jeep?",
    answer:
      "Our jeeps can comfortably accommodate up to 6 passengers plus the driver and guide. For larger groups, we can arrange multiple jeeps to ensure everyone enjoys the experience.",
  },
  {
    question: "Do you offer hotel pickup and drop-off?",
    answer:
      "Yes, we offer complimentary pickup and drop-off from hotels in Habarana, Sigiriya, and Dambulla. For hotels outside these areas, there may be an additional charge.",
  },
]

const bookingFAQs: readonly Faq[] = [
  {
    question: "How far in advance should I book a safari?",
    answer:
      "We recommend booking at least 3-5 days in advance during regular season and 1-2 weeks during peak season (December-January and July-August) to ensure availability.",
  },
  {
    question: "Do you offer hotel pickup and drop-off?",
    answer:
      "Yes, we offer complimentary pickup and drop-off from hotels in Habarana, Sigiriya, and Dambulla. For hotels outside these areas, there may be an additional charge.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, major credit cards, and bank transfers. For credit card payments, a small processing fee may apply.",
  },
  {
    question: "What is your cancellation policy?",
    // The previous answer was an unfinished sentence and implied terms nobody
    // has confirmed. Replace with the owner's written policy once confirmed.
    answer:
      "Cancellation terms depend on the tour and the date. Message us on WhatsApp before you book and we will confirm them in writing.",
  },
]

const FAQS: Record<FaqVariant, readonly Faq[]> = {
  safari: safariFAQs,
  booking: bookingFAQs,
}

export const FAQ_SUBTITLES: Record<FaqVariant, string> = {
  safari: "Find answers to common questions about our safari and tour packages",
  booking:
    "Find answers to common questions about contacting and booking with us",
}

export function getFaqs(variant: FaqVariant): readonly Faq[] {
  return FAQS[variant]
}
