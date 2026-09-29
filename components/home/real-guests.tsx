import Image from "next/image"
import Script from "next/script"

import { TrustLine } from "@/components/common/trust-line"
import { imagery } from "@/config/imagery"

export function RealGuests() {
  return (
    <section className="bg-surface-sunken px-4 py-16 md:py-20">
      <div className="container mx-auto grid gap-8">
        <div className="grid max-w-2xl gap-3">
          <h2>Guests on safari with us</h2>
          <TrustLine />
        </div>
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {imagery.guests.map((photo) => (
            <li
              key={photo.src}
              className="relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
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
