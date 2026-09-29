"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  EnvelopeOpen,
  WhatsappLogo,
  MapPin,
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
} from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import FAQSection from "@/components/common/faq-section"
import { siteConfig } from "@/config/site"

// Social media link component
function SocialLink({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string
  icon: React.ElementType
  label: string
  color: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex h-12 w-12 items-center justify-center rounded-full ${color} text-white transition-transform hover:scale-110`}
      aria-label={label}
    >
      <Icon size={24} />
    </a>
  )
}

export default function ContactPage() {
  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-white md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl">
            Have questions or ready to book your safari adventure? Get in touch
            with our team.
          </p>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-xl bg-white shadow-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-64 bg-primary/10 md:h-full">
                  <Image
                    src="https://res.cloudinary.com/travelhabarana/image/upload/v1747225191/cover_yulgqs.jpg"
                    alt="Cover Image"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Contact Details */}
                <div className="p-8 md:p-10">
                  <h2 className="mb-6 text-2xl font-bold text-gray-800">
                    Get In Touch
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="mr-4 rounded-full bg-primary/10 p-3">
                        <WhatsappLogo className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">WhatsApp</h3>
                        <a
                          href={siteConfig.links.whatsapp}
                          className="text-gray-600 hover:text-primary hover:underline"
                        >
                          {siteConfig.contact.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mr-4 rounded-full bg-primary/10 p-3">
                        <EnvelopeOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Email</h3>
                        <a
                          href={siteConfig.links.email}
                          className="text-gray-600 hover:text-primary hover:underline"
                        >
                          {siteConfig.contact.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mr-4 rounded-full bg-primary/10 p-3">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Location</h3>
                        <a
                          href={siteConfig.links.googleMaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-primary hover:underline"
                        >
                          {siteConfig.contact.address}
                        </a>
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div>
                      <h3 className="mb-4 text-lg font-bold text-gray-800">
                        Connect With Us
                      </h3>
                      <div className="flex space-x-3">
                        <SocialLink
                          href={siteConfig.links.facebook}
                          icon={FacebookLogo}
                          label="Facebook"
                          color="bg-[#1877F2]"
                        />
                        <SocialLink
                          href={siteConfig.links.instagram}
                          icon={InstagramLogo}
                          label="Instagram"
                          color="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]"
                        />
                        <SocialLink
                          href={siteConfig.links.tiktok}
                          icon={TiktokLogo}
                          label="TikTok"
                          color="bg-black"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        asChild
                        className="w-full bg-primary hover:bg-primary"
                      >
                        <Link href="/book-now">Send Booking Inquiry</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <FAQSection variant="booking" />
    </main>
  )
}
