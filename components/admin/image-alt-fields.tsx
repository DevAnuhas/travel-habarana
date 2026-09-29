"use client"

import Image from "next/image"
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ImageAlt } from "@/lib/package-serialize"
import type { PackageInput } from "@/lib/types"

/** Pure: set, replace or clear one photo's description; drop entries for photos no longer present. */
export function withImageAlt(
  images: string[],
  alts: ImageAlt[] | null | undefined,
  src: string,
  alt: string
): ImageAlt[] | null {
  const kept = (alts ?? []).filter(
    (entry) => entry.src !== src && images.includes(entry.src)
  )
  const next = alt.trim() ? [...kept, { src, alt }] : kept
  return next.length ? next : null
}

/** One description input beside each photo, so a description can only belong to the photo it sits next to. */
export function ImageAltFields({
  control,
  setValue,
}: {
  control: Control<PackageInput>
  setValue: UseFormSetValue<PackageInput>
}) {
  const images = useWatch({ control, name: "images" }) ?? []
  const alts = useWatch({ control, name: "imageAlts" })
  if (!images.length) return null

  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium">
        Photo descriptions (for screen readers and Google)
      </legend>
      {images.map((src, index) => (
        <div
          key={src}
          className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3"
        >
          <div className="relative size-16 overflow-hidden rounded">
            <Image
              src={src}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`image-alt-${index}`}>Photo {index + 1}</Label>
            <Input
              id={`image-alt-${index}`}
              maxLength={150}
              placeholder="What does this photo show? e.g. Elephants drinking at the Minneriya tank"
              value={alts?.find((entry) => entry.src === src)?.alt ?? ""}
              onChange={(event) =>
                setValue(
                  "imageAlts",
                  withImageAlt(images, alts, src, event.target.value),
                  { shouldDirty: true }
                )
              }
            />
          </div>
        </div>
      ))}
    </fieldset>
  )
}
