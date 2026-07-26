import { createClient } from "@sanity/client"
import { randomUUID } from "node:crypto"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_TOKEN
const apply = process.argv.includes("--apply")

if (!projectId || !dataset) {
  throw new Error(
    "Sanity project and dataset environment variables are required"
  )
}

if (apply && !token) {
  throw new Error("SANITY_API_TOKEN is required when using --apply")
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-06-10",
  token,
  useCdn: false,
})

type PortableTextBlock = {
  _key: string
  _type: "block"
  style: "normal" | "h2" | "h3"
  markDefs: Array<{
    _key: string
    _type: "link"
    href: string
  }>
  children: Array<{
    _key: string
    _type: "span"
    marks: string[]
    text: string
  }>
}

function block(
  text: string,
  style: PortableTextBlock["style"] = "normal"
): PortableTextBlock {
  return {
    _key: randomUUID(),
    _type: "block",
    style,
    markDefs: [],
    children: [
      {
        _key: randomUUID(),
        _type: "span",
        marks: [],
        text,
      },
    ],
  }
}

const pillarBody = [
  block("Habarana: a practical base for wildlife safaris", "h2"),
  block(
    "Habarana sits between Minneriya National Park, Kaudulla National Park, and Hurulu Eco Park. That makes it a convenient starting point for travelers staying in Habarana, Sigiriya, or nearby parts of Sri Lanka’s Cultural Triangle."
  ),
  block(
    "Elephants move between these protected areas as water, food, weather, and park conditions change. Instead of promising one park months in advance, Ceylon Safari checks current local conditions and recommends the park offering the most suitable wildlife experience on the day."
  ),
  block("Which safari park should you visit?", "h2"),
  block("Minneriya National Park", "h3"),
  block(
    "Minneriya is known for open grasslands around its reservoir and seasonal elephant sightings. It is close to Habarana and is a popular choice when wildlife activity is strong inside the park."
  ),
  block("Kaudulla National Park", "h3"),
  block(
    "Kaudulla combines forest, grassland, and reservoir scenery. Elephant herds may move here during the drier part of the year, so it can be the better option when conditions at Minneriya change."
  ),
  block("Hurulu Eco Park", "h3"),
  block(
    "Hurulu Eco Park is another important habitat near Habarana. Its wooded landscape provides a different safari setting and can offer rewarding elephant and bird sightings when animals move away from the larger national parks."
  ),
  block("Morning or afternoon jeep safari?", "h2"),
  block(
    "Morning safaris offer cooler temperatures, softer light, and an early start before the middle of the day. Afternoon safaris can be rewarding as wildlife becomes more active again and the light changes toward sunset. No time guarantees a sighting, so choose the departure that best fits your itinerary and current local advice."
  ),
  block("What to expect on a private safari", "h2"),
  block(
    "Your driver-guide collects you at the agreed meeting point or eligible nearby pickup location and takes you to the park selected for that day. The route and time inside the park depend on wildlife movement, road conditions, and park rules. Package inclusions vary, so confirm whether entrance tickets, pickup, and refreshments are included before booking."
  ),
  block(
    "Bring drinking water, sun protection, a hat, binoculars if you have them, and a camera with a secure strap. Neutral-colored clothing is practical. Keep voices low, remain inside the jeep where required, and follow the driver-guide’s instructions."
  ),
  block("Responsible wildlife viewing", "h2"),
  block(
    "A good safari gives animals space. Ceylon Safari does not promise specific sightings and asks guests not to encourage drivers to crowd, chase, feed, or block wildlife. Patient observation is safer for visitors and less disruptive for elephants and other animals."
  ),
  block("Planning from Habarana and Minneriya", "h2"),
  block(
    "Habarana works well as a safari base because it is near all three parks and can be combined with Sigiriya, Polonnaruwa, a village experience, or a Sri Lankan cooking class. If your schedule is flexible, ask which park has had the most suitable recent conditions before choosing a package."
  ),
  block(
    "Browse the current safari packages or send an inquiry with your travel date, pickup location, group size, and preferred time. The Ceylon Safari team will confirm availability, the recommended park, exact inclusions, and the meeting or pickup details."
  ),
]

const primaryPatch = {
  title: "Habarana Jeep Safari: Minneriya, Kaudulla or Hurulu",
  excerpt:
    "Plan a private jeep safari from Habarana to Minneriya, Kaudulla, or Hurulu Eco Park, with the park selected for current wildlife conditions.",
  body: pillarBody,
  "mainImage.alt":
    "Elephants seen during a private jeep safari near Habarana, Sri Lanka",
  seo: {
    title: "Habarana Jeep Safari | Minneriya, Kaudulla & Hurulu",
    description:
      "Plan a private Habarana jeep safari to Minneriya, Kaudulla, or Hurulu Eco Park with local guidance on the best park for current conditions.",
    noIndex: false,
  },
  isFeatured: true,
}

const duplicateSlugs = [
  "habarana-safari-jeep",
  "habarana-elephant-jeep-safari",
  "habaranaelephantjeepsafari",
]

const editorialPatches = [
  {
    slug: "minneriya-jeep-safari",
    set: {
      title: "Minneriya Jeep Safari Guide from Habarana",
      excerpt:
        "Plan a Minneriya National Park jeep safari from Habarana, including timing, wildlife expectations, practical tips, and responsible viewing.",
      "mainImage.alt":
        "Elephants in Minneriya National Park during a jeep safari",
      seo: {
        title: "Minneriya Jeep Safari from Habarana | Local Guide",
        description:
          "Plan your Minneriya jeep safari from Habarana with practical timing, wildlife, pickup, and responsible viewing advice from local guides.",
        noIndex: false,
      },
    },
  },
  {
    slug: "kaudulla-national-park-jeep-safari",
    set: {
      excerpt:
        "Plan a Kaudulla National Park jeep safari from Habarana, with practical guidance on timing, wildlife, park conditions, and what to bring.",
      "mainImage.alt":
        "Wild elephants seen on a Kaudulla National Park jeep safari",
      seo: {
        title: "Kaudulla National Park Jeep Safari from Habarana",
        description:
          "Plan a Kaudulla National Park jeep safari from Habarana with local advice on wildlife, timing, current park conditions, and what to bring.",
        noIndex: false,
      },
    },
  },
  {
    slug: "cooking-class-habarana",
    set: {
      title: "Sri Lankan Cooking Class in Habarana",
      excerpt:
        "Join a hands-on Sri Lankan cooking class in Habarana and learn how local ingredients, spices, and traditional methods shape village cuisine.",
      "mainImage.alt":
        "Guests learning to prepare traditional Sri Lankan food in Habarana",
      seo: {
        title: "Sri Lankan Cooking Class in Habarana | Ceylon Safari",
        description:
          "Join a hands-on Sri Lankan cooking class in Habarana featuring local ingredients, traditional methods, and a relaxed village experience.",
        noIndex: false,
      },
    },
  },
  {
    slug: "minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures",
    set: {
      excerpt:
        "Compare Minneriya, Kaudulla, and Hurulu Eco Park near Habarana, including landscapes, seasonal wildlife movement, and safari planning tips.",
      "mainImage.alt":
        "Wild elephants roaming in a safari park near Habarana, Sri Lanka",
      seo: {
        title: "Minneriya, Kaudulla or Hurulu? Habarana Safari Guide",
        description:
          "Compare Minneriya, Kaudulla, and Hurulu Eco Park near Habarana to understand seasonal wildlife movement and choose a suitable safari.",
        noIndex: false,
      },
    },
  },
]

type PostDocument = {
  _id: string
  slug: string
  body?: Array<Record<string, unknown>>
}

async function main() {
  const posts = await client.fetch<PostDocument[]>(
    `*[_type == "post" && defined(slug.current)]{
		_id,
		"slug": slug.current,
		body
	}`
  )

const bySlug = new Map(posts.map((post) => [post.slug, post]))
const primary = bySlug.get("habarana-jeep-safari")
const editorialAuthorId = "author-ceylon-safari-editorial-team"

if (!primary) {
  throw new Error("The canonical Habarana safari article was not found")
}

const transaction = client
  .transaction()
  .createIfNotExists({
    _id: editorialAuthorId,
    _type: "author",
    name: "Ceylon Safari Editorial Team",
    slug: {
      _type: "slug",
      current: "ceylon-safari-editorial-team",
    },
    bio: [
      block(
        "Local safari planning guidance from the Ceylon Safari team in Habarana, Sri Lanka."
      ),
    ],
  })
  .patch(primary._id, (patch) => patch.set(primaryPatch))

for (const slug of duplicateSlugs) {
  const post = bySlug.get(slug)
  if (!post) {
    throw new Error(`Expected duplicate article not found: ${slug}`)
  }
  transaction.patch(post._id, (patch) =>
    patch.set({
      seo: { noIndex: true },
      isFeatured: false,
    })
  )
}

for (const { slug, set } of editorialPatches) {
  const post = bySlug.get(slug)
  if (!post) {
    throw new Error(`Expected article not found: ${slug}`)
  }
  transaction.patch(post._id, (patch) => patch.set(set))
}

for (const post of posts) {
  transaction.patch(post._id, (patch) =>
    patch.set({
      author: {
        _type: "reference",
        _ref: editorialAuthorId,
      },
    })
  )

  if (post.slug === "habarana-jeep-safari") continue

  const body = post.body?.map((item) => {
    if (item._type !== "block") return item

    const children = Array.isArray(item.children)
      ? item.children.map((child) => {
          if (
            typeof child === "object" &&
            child !== null &&
            "text" in child &&
            typeof child.text === "string"
          ) {
            return {
              ...child,
              text: child.text
                .replaceAll(
                  "Travel Habarana Jeep Safari & Village Foods",
                  "Ceylon Safari"
                )
                .replaceAll("Travel Habarana", "Ceylon Safari"),
            }
          }
          return child
        })
      : item.children

    return {
      ...item,
      style: item.style === "h1" ? "h2" : item.style,
      children,
    }
  })

  if (body) {
    transaction.patch(post._id, (patch) => patch.set({ body }))
  }
}

const categoryPatches = [
  {
    slug: "jeep-safari-habarana",
    title: "Habarana Jeep Safaris",
    description:
      "Local guides to jeep safaris from Habarana, including Minneriya, Kaudulla, and Hurulu Eco Park.",
  },
  {
    slug: "minneriya-national-park-jeep-safari",
    title: "Minneriya National Park Safaris",
    description:
      "Planning guides for Minneriya National Park jeep safaris from Habarana.",
  },
  {
    slug: "cookingclass",
    title: "Sri Lankan Cooking Classes",
    description:
      "Food and cooking experiences in Habarana featuring Sri Lankan ingredients and traditional methods.",
  },
]

for (const category of categoryPatches) {
  const document = await client.fetch<{ _id: string } | null>(
    `*[_type == "category" && slug.current == $slug][0]{_id}`,
    { slug: category.slug }
  )

  if (document) {
    transaction.patch(document._id, (patch) =>
      patch.set({
        title: category.title,
        description: category.description,
      })
    )
  }
}

if (!apply) {
  console.log(
    `Dry run: would consolidate ${duplicateSlugs.length} duplicate articles, improve ${editorialPatches.length + 1} indexable articles, and normalize the blog taxonomy.`
  )
  console.log(
    "Run `pnpm migrate:blog-seo -- --apply` to commit the transaction."
  )
  process.exit(0)
}

await transaction.commit({
  returnDocuments: false,
  visibility: "sync",
})

  console.log("Sanity blog SEO migration committed successfully.")
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "The blog SEO migration failed"
  )
  process.exitCode = 1
})
