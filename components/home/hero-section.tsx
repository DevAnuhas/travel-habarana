import Link from "next/link"
import Image from "next/image"
import {
  CaretDoubleDown,
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
  WhatsappLogo,
  EnvelopeOpen,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr"
import type { IconProps } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

function SocialIcon({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<IconProps>
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
      aria-label={label}
    >
      <Icon size={24} weight="duotone" className="text-white" />
    </a>
  )
}

function HeroSection() {
  return (
    <section className="relative h-screen">
      {/* Background image */}
      <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/travelhabarana/image/upload/v1747296498/hero-image_hmg1je.webp"
            alt="Elephant jeep safari near Minneriya and Habarana"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Hero content */}
      <div className="relative container mx-auto flex h-full items-center px-4">
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
          {/* Left side content */}
          <div className="flex flex-col justify-center text-center text-white lg:col-span-9 lg:text-left">
            <h1
              className="mb-4 text-5xl leading-tight font-bold md:text-6xl lg:text-7xl"
            >
              Private Jeep Safaris in Habarana &amp; Minneriya
            </h1>

            <p
              className="mx-auto mb-8 max-w-2xl text-lg md:text-xl lg:mx-0"
            >
              Explore Minneriya, Kaudulla, and Hurulu Eco Park with a local
              Ceylon Safari guide, or pair your safari with an authentic
              Habarana village experience.
            </p>

            <div
              className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <a href="#packages">
                <Button size="lg">View Packages</Button>
              </a>
              <Link href="/book-now" className="group">
                <Button variant="secondary" size="lg" className="">
                  Book Now
                  <ArrowRight className="ml-1 transition-all group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side social media links */}
          <div className="flex items-center justify-center lg:col-span-3 lg:justify-end">
            <div
              className="mt-8 flex flex-row gap-4 md:flex-row lg:mt-0 lg:flex-col"
            >
              <SocialIcon
                href={siteConfig.links.facebook}
                icon={FacebookLogo}
                label="Facebook"
              />
              <SocialIcon
                href={siteConfig.links.instagram}
                icon={InstagramLogo}
                label="Instagram"
              />
              <SocialIcon
                href={siteConfig.links.tiktok}
                icon={TiktokLogo}
                label="TikTok"
              />
              <SocialIcon
                href={siteConfig.links.whatsapp}
                icon={WhatsappLogo}
                label="WhatsApp"
              />
              <SocialIcon
                href={`mailto:${siteConfig.contact.email}`}
                icon={EnvelopeOpen}
                label="Email"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator at the bottom */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
        >
          <div className="animate-bounce">
            <CaretDoubleDown size={24} className="text-white" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
