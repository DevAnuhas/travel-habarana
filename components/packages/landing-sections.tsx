import {
  Check,
  Clock,
  MapPin,
  Sun,
  Users,
  X,
} from "@phosphor-icons/react/dist/ssr"

import { ContactActions } from "@/components/common/contact-actions"
import { FaqList } from "@/components/common/faq-list"
import { TrustLine } from "@/components/common/trust-line"
import { SeasonStrip } from "@/components/packages/season-strip"
import { splitParagraphs } from "@/lib/package-landing"
import type {
  ItineraryStep,
  PackageFaq,
  PublicPackage,
} from "@/lib/package-serialize"
import { formatPrice, PRICE_ON_REQUEST } from "@/lib/pricing"
import { buildSeasonCells, type Season } from "@/lib/season"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return (
    <section aria-labelledby={id} className="grid gap-4">
      <h2 id={id} className="text-2xl md:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function FactChips({
  duration,
  groupSize,
  timeSlots,
  pickupAreas,
}: {
  duration: string
  groupSize?: string
  timeSlots?: string[]
  pickupAreas?: string[]
}) {
  const chips: Array<{ icon: typeof Clock; label: string; fact: string }> = [
    { icon: Clock, label: duration, fact: "duration" },
  ]
  if (groupSize) chips.push({ icon: Users, label: groupSize, fact: "group" })
  if (timeSlots?.length)
    chips.push({ icon: Sun, label: timeSlots.join(" · "), fact: "times" })
  if (pickupAreas?.length)
    chips.push({ icon: MapPin, label: "Hotel pickup", fact: "pickup" })

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Key facts">
      {chips.map(({ icon: Icon, label, fact }) => (
        <li
          key={fact}
          data-fact={fact}
          className="inline-flex items-center gap-1.5 rounded border bg-card px-3 py-1.5 text-sm"
        >
          <Icon className="size-4 text-primary" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  )
}

/** Mobile first viewport: what, price, trust, duration, WhatsApp. Desktop CTAs live in the booking panel. */
export function PackageHeader({ pkg }: { pkg: PublicPackage }) {
  const price = formatPrice(pkg)
  return (
    <header className="grid gap-3">
      <h1 className="text-3xl md:text-5xl">{pkg.name}</h1>
      <p
        data-price
        className={price ? "text-lg font-semibold" : "text-muted-foreground"}
      >
        {price ?? `${PRICE_ON_REQUEST} · reply within 24 hours`}
      </p>
      <TrustLine />
      <FactChips
        duration={pkg.duration}
        groupSize={pkg.groupSize}
        timeSlots={pkg.timeSlots}
        pickupAreas={pkg.pickupAreas}
      />
      <ContactActions compact packageName={pkg.name} className="lg:hidden" />
      {pkg.summary && (
        <p className="max-w-prose text-lg text-muted-foreground">
          {pkg.summary}
        </p>
      )}
    </header>
  )
}

function CheckList({
  items,
  icon: Icon = Check,
}: {
  items: string[]
  icon?: typeof Check
}) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Icon
            className="mt-1 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function Highlights({ items }: { items?: string[] }) {
  if (!items?.length) return null
  return (
    <Section title="Why travellers choose it">
      <CheckList items={items} />
    </Section>
  )
}

export function WhenToGo({ season }: { season?: Season }) {
  // Gate on normalised cells, not on the raw object: {peak: [0, 13]} is
  // truthy but has nothing to show, and would leave an empty heading.
  if (!buildSeasonCells(season)) return null
  return (
    <Section title="When to go">
      <SeasonStrip season={season} />
    </Section>
  )
}

export function Itinerary({ steps }: { steps?: ItineraryStep[] }) {
  if (!steps?.length) return null
  return (
    <Section title="How the day runs">
      <ol className="grid gap-4 border-l-2 border-primary/30 pl-6">
        {steps.map((step, index) => (
          <li key={`${index}-${step.title}`} className="relative grid gap-0.5">
            <span
              className="absolute top-1.5 -left-[31px] size-3 rounded-full bg-primary"
              aria-hidden="true"
            />
            {step.time && (
              <span className="text-sm font-medium text-primary tabular-nums">
                {step.time}
              </span>
            )}
            <span className="font-semibold">{step.title}</span>
            {step.detail && (
              <span className="text-muted-foreground">{step.detail}</span>
            )}
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function IncludedList({
  included,
  notIncluded,
}: {
  included: string[]
  notIncluded?: string[]
}) {
  if (!included.length && !notIncluded?.length) return null
  return (
    <Section title="What's included">
      <div className="grid gap-6 md:grid-cols-2">
        {included.length > 0 && <CheckList items={included} />}
        {notIncluded?.length ? (
          <div className="grid gap-2">
            <h3 className="text-base font-semibold">Not included</h3>
            <CheckList items={notIncluded} icon={X} />
          </div>
        ) : null}
      </div>
    </Section>
  )
}

export function PickupAndTimes({
  pickupAreas,
  timeSlots,
}: {
  pickupAreas?: string[]
  timeSlots?: string[]
}) {
  if (!pickupAreas?.length && !timeSlots?.length) return null
  return (
    <Section title="Pickup and start times">
      <dl className="grid gap-4 sm:grid-cols-2">
        {pickupAreas?.length ? (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Hotel pickup from
            </dt>
            <dd>{pickupAreas.join(", ")}</dd>
          </div>
        ) : null}
        {timeSlots?.length ? (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Start times
            </dt>
            <dd className="tabular-nums">{timeSlots.join(" · ")}</dd>
          </div>
        ) : null}
      </dl>
    </Section>
  )
}

export function WhatToBring({ items }: { items?: string[] }) {
  if (!items?.length) return null
  return (
    <Section title="What to bring">
      <CheckList items={items} />
    </Section>
  )
}

export function AboutExperience({ description }: { description: string }) {
  const paragraphs = splitParagraphs(description)
  if (!paragraphs.length) return null
  return (
    <Section title="About this experience">
      <div className="grid max-w-prose gap-4 leading-relaxed">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </Section>
  )
}

export function PackageFaqs({ faqs }: { faqs?: PackageFaq[] }) {
  if (!faqs?.length) return null
  return (
    <Section title="Questions travellers ask">
      <FaqList faqs={faqs} />
    </Section>
  )
}
