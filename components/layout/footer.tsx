import Link from "next/link"
import Image from "next/image"
import {
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
  WhatsappLogo,
  EnvelopeOpen,
  MapPinLine,
  Phone,
} from "@phosphor-icons/react/dist/ssr"
import { siteConfig } from "@/config/site"

const COPYRIGHT_YEAR = 2026

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Company Info */}
          <div>
            {/* Logo */}
            <div className="mb-4 flex items-center">
              <Image
                src={siteConfig.logoDark}
                alt={`${siteConfig.name} Logo`}
                width={25}
                height={25}
                className="mr-2"
              />
              <span className="font-serif text-xl font-bold">
                {siteConfig.name}
              </span>
            </div>
            <p className="mb-4 text-gray-300">{siteConfig.description}</p>
            <div className="flex space-x-4">
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 transition-colors hover:text-secondary"
                aria-label="Facebook"
              >
                <FacebookLogo size={20} />
              </a>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 transition-colors hover:text-secondary"
                aria-label="Instagram"
              >
                <InstagramLogo size={20} />
              </a>
              <a
                href={siteConfig.links.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 transition-colors hover:text-secondary"
                aria-label="TikTok"
              >
                <TiktokLogo size={20} />
              </a>
              <a
                href={siteConfig.links.whatsapp}
                className="text-gray-300 transition-colors hover:text-secondary"
                aria-label="WhatsApp"
              >
                <WhatsappLogo size={20} />
              </a>
              <a
                href={siteConfig.links.email}
                className="text-gray-300 transition-colors hover:text-secondary"
                aria-label="Email"
              >
                <EnvelopeOpen size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-xl font-bold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 transition-colors hover:text-secondary"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/packages"
                  className="text-gray-300 transition-colors hover:text-secondary"
                >
                  Safari Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/book-now"
                  className="text-gray-300 transition-colors hover:text-secondary"
                >
                  Book Now
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="text-gray-300 transition-colors hover:text-secondary"
                >
                  Safari Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 transition-colors hover:text-secondary"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-xl font-bold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone size={18} className="mt-1 mr-2 flex-shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phoneE164}`}
                  className="text-gray-300 hover:text-secondary"
                >
                  {siteConfig.contact.phone}
                </a>
              </div>
              <div className="flex items-start">
                <EnvelopeOpen size={18} className="mt-1 mr-2 flex-shrink-0" />
                <a
                  href={siteConfig.links.email}
                  className="text-gray-300 hover:text-secondary"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
              <div className="flex items-start">
                <MapPinLine size={18} className="mt-1 mr-2 flex-shrink-0" />
                <a
                  href={siteConfig.links.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-secondary"
                >
                  {siteConfig.contact.address}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; {COPYRIGHT_YEAR} {siteConfig.name}. All rights reserved.
          </p>
          <Link
            href="/privacy"
            className="text-xs text-gray-300 transition-colors hover:text-secondary"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
