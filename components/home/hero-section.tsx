"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  CaretDoubleDown,
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
  WhatsappLogo,
  EnvelopeOpen,
  ArrowRight,
  IconProps,
} from "@phosphor-icons/react"
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
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      <Icon size={24} weight="duotone" className="text-white" />
    </motion.a>
  )
}

function HeroSection() {
  return (
    <section className="relative h-screen">
      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
        >
          <Image
            src="https://res.cloudinary.com/travelhabarana/image/upload/v1747296498/hero-image_hmg1je.webp"
            alt="Elephant jeep safari near Minneriya and Habarana"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Hero content */}
      <div className="relative container mx-auto flex h-full items-center px-4">
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
          {/* Left side content */}
          <div className="flex flex-col justify-center text-center text-white lg:col-span-9 lg:text-left">
            <motion.h1
              className="mb-4 text-5xl leading-tight font-bold md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Private Jeep Safaris in Habarana &amp; Minneriya
            </motion.h1>

            <motion.p
              className="mx-auto mb-8 max-w-2xl text-lg md:text-xl lg:mx-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Explore Minneriya, Kaudulla, and Hurulu Eco Park with a local
              Ceylon Safari guide, or pair your safari with an authentic
              Habarana village experience.
            </motion.p>

            <motion.div
              className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="#packages">
                <Button size="lg">View Packages</Button>
              </Link>
              <Link href="/book-now" className="group">
                <Button variant="secondary" size="lg" className="">
                  Book Now
                  <ArrowRight className="ml-1 transition-all group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right side social media links */}
          <div className="flex items-center justify-center lg:col-span-3 lg:justify-end">
            <motion.div
              className="mt-8 flex flex-row gap-4 md:flex-row lg:mt-0 lg:flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
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
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator at the bottom */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          >
            <CaretDoubleDown size={24} className="text-white" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
