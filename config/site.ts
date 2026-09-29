export const siteConfig = {
  name: "Ceylon Safari",
  formerNames: [
    "Travel Habarana Jeep Safari & Village Foods",
    "Travel Habarana",
  ],
  description:
    "Private jeep safaris to Minneriya, Kaudulla, and Hurulu Eco Park, plus authentic village experiences led by a local Habarana team.",
  url: "https://www.ceylonsafari.com",
  locale: "en_LK",
  logo: "/assets/ceylon-safari-logo.png",
  logoDark: "/assets/ceylon-safari-logo-white.png",
  ogImage: "/assets/ceylon-safari-opengraph.jpg",
  links: {
    email: "mailto:habaranatravel@gmail.com",
    facebook:
      "https://facebook.com/people/Jeep-safari-habarana/61557160063166/",
    instagram: "https://www.instagram.com/travel_in_habarana/",
    tiktok: "https://www.tiktok.com/@travel.in.habaran",
    googleMaps: "https://maps.app.goo.gl/jtjd3mUANDnH3rRu5",
    googleReview: "https://g.page/r/CZ1tTFd1xJQtEBM/review",
  },
  // Google Business Profile rating shown as a trust line. Update it when the
  // count changes; never round it up.
  reviews: {
    rating: 5,
    count: 27,
    source: "Google",
    url: "https://maps.app.goo.gl/jtjd3mUANDnH3rRu5",
  },
  author: "Ceylon Safari",
  contact: {
    email: "habaranatravel@gmail.com",
    phone: "+94 76 667 5883",
    phoneE164: "+94766675883",
    address: "Anuradhapura Road, Habarana 50150, Sri Lanka",
    streetAddress: "Anuradhapura Road",
    addressLocality: "Habarana",
    postalCode: "50150",
    addressCountry: "LK",
  },
  geo: {
    latitude: 8.0448936,
    longitude: 80.7515121,
  },
  openingHours: "Mo-Su 00:00-23:59",
  serviceAreas: [
    "Habarana",
    "Minneriya National Park",
    "Kaudulla National Park",
    "Hurulu Eco Park",
  ],
} as const
