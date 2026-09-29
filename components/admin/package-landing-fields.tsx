"use client"

import { useState } from "react"
import type { Control } from "react-hook-form"

import { LinesTextarea } from "@/components/admin/lines-textarea"
import { SeasonPicker } from "@/components/admin/season-picker"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  formatFaqs,
  formatItinerary,
  formatLines,
  parseFaqs,
  parseItinerary,
  parseLines,
} from "@/lib/package-landing"
import type { PackageInput } from "@/lib/types"

type TextKey = "summary" | "seoTitle" | "seoDescription" | "groupSize"
type ListKey =
  "highlights" | "notIncluded" | "timeSlots" | "pickupAreas" | "whatToBring"

const TEXT_FIELDS: Array<{
  name: TextKey
  label: string
  hint: string
  multiline?: boolean
  placeholder: string
}> = [
  {
    name: "summary",
    label: "Summary",
    hint: "Shown on cards and under the page title. Up to 220 characters.",
    multiline: true,
    placeholder:
      "See the elephant gathering at Minneriya tank with a local guide.",
  },
  {
    name: "groupSize",
    label: "Group size",
    hint: "Shown as a fact chip. Only write what you offer.",
    placeholder: "Up to 6 per jeep",
  },
  {
    name: "seoTitle",
    label: "Search title",
    hint: "Up to 70 characters. The brand is added automatically.",
    placeholder: "Minneriya National Park Jeep Safari from Habarana",
  },
  {
    name: "seoDescription",
    label: "Search description",
    hint: "Up to 160 characters. Leave blank to use the summary.",
    multiline: true,
    placeholder: "Minneriya jeep safari from Habarana with a local guide.",
  },
]

const LIST_FIELDS: Array<{
  name: ListKey
  label: string
  hint: string
  placeholder: string
}> = [
  {
    name: "highlights",
    label: "Highlights",
    hint: "One per line.",
    placeholder: "Elephant herds at the Minneriya tank",
  },
  {
    name: "notIncluded",
    label: "Not included",
    hint: "One per line.",
    placeholder: "Park entrance tickets",
  },
  {
    name: "timeSlots",
    label: "Start times",
    hint: "One per line.",
    placeholder: "6:00 am",
  },
  {
    name: "pickupAreas",
    label: "Hotel pickup areas",
    hint: "One per line. Shown as 'Hotel pickup from…'. Mention any charge in the price note.",
    placeholder: "Habarana",
  },
  {
    name: "whatToBring",
    label: "What to bring",
    hint: "One per line.",
    placeholder: "Hat and sunscreen",
  },
]

export function PackageLandingFields({
  control,
}: {
  control: Control<PackageInput>
}) {
  const [droppedFaqs, setDroppedFaqs] = useState(0)

  return (
    <div className="space-y-5">
      {TEXT_FIELDS.map((config) => (
        <FormField
          key={config.name}
          control={control}
          name={config.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{config.label}</FormLabel>
              <FormControl>
                {config.multiline ? (
                  <Textarea
                    rows={2}
                    placeholder={config.placeholder}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                ) : (
                  <Input
                    placeholder={config.placeholder}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                )}
              </FormControl>
              <FormDescription>{config.hint}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      {LIST_FIELDS.map((config) => (
        <FormField
          key={config.name}
          control={control}
          name={config.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={`landing-${config.name}`}>
                {config.label}
              </FormLabel>
              <LinesTextarea
                id={`landing-${config.name}`}
                value={field.value}
                format={formatLines}
                parse={parseLines}
                isEmpty={(value) => value.length === 0}
                onChange={field.onChange}
                placeholder={config.placeholder}
              />
              <FormDescription>{config.hint}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <FormField
        control={control}
        name="itinerary"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="landing-itinerary">How the day runs</FormLabel>
            <LinesTextarea
              id="landing-itinerary"
              value={field.value}
              format={(steps) => formatItinerary(steps)}
              parse={parseItinerary}
              isEmpty={(steps) => steps.length === 0}
              onChange={field.onChange}
              placeholder={
                "2:30 pm | Hotel pickup | In an open safari jeep\n3:15 pm | Enter Minneriya National Park"
              }
              rows={5}
            />
            <FormDescription>
              One step per line: time | title | detail. Time and detail are
              optional.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="faqs"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="landing-faqs">Package FAQs</FormLabel>
            <LinesTextarea
              id="landing-faqs"
              value={field.value}
              format={(faqs) => formatFaqs(faqs)}
              parse={(text) => {
                const result = parseFaqs(text)
                setDroppedFaqs(result.dropped)
                return result.faqs
              }}
              isEmpty={(faqs) => faqs.length === 0}
              onChange={field.onChange}
              placeholder={
                "Is the jeep private?\nYes, the jeep is only for your group.\n\nDo you pick up from Sigiriya?\nYes."
              }
              rows={6}
            />
            <FormDescription>
              Question on the first line, answer below it, and a blank line
              between questions.
            </FormDescription>
            {droppedFaqs > 0 && (
              <p className="text-sm text-destructive" role="status">
                {droppedFaqs} question{droppedFaqs === 1 ? " has" : "s have"} no
                answer and won&apos;t be saved.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="season"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Best months</FormLabel>
            <SeasonPicker value={field.value} onChange={field.onChange} />
            <FormDescription>Click a month: good → best → off.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
