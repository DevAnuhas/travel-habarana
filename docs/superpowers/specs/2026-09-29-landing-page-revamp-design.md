# Ceylon Safari: homepage and package landing-page revamp

Date: 29 Sep 2026 · Status: **approved** (gpt-6-sol, high; review rounds 1–2) · Owner decisions delegated to the reviewer by the user

## 1. Intent

**What the user asked for:** "revamp the UI/UX of the site and package pages (as landing pages) to make them more engaging and converting."

**Constraints the user set:**
- No analytics or event tracking yet. PostHog is the likely choice later and needs client cost approval.
- The old domain is gone for good.
- The owner handles off-site work and admin content edits.
- I implement after the reviewer approves.

**Who converts:** foreign travellers (UK, EU, India, Australia) planning or already in the Cultural Triangle (Habarana, Sigiriya, Dambulla).
- They are mostly on phones.
- They compare us against TripAdvisor, GetYourGuide and Viator listings, which show price, duration, pickup, reviews and cancellation terms up front.
- Real bookings come through WhatsApp and phone. The web form produced 7 inquiries in 16 months.

**Success criteria:**
1. **First viewport at 390×844**, verified in a real browser with both the shortest and the longest live package names:
   - Homepage: the H1, trust line, WhatsApp button, and for each safari its name, duration, and price or "Price on request".
   - Package page: the H1, duration, price or "Price on request", trust line and WhatsApp.
2. A WhatsApp action is visible at every width below the desktop navbar breakpoint (`lg`, 1024 px) via the contact bar. From `lg` up it's in the navbar. The bar never covers the footer or the last content, including with 125% text and a phone safe-area inset.
3. **Content release gate (depends on owner edits):** each live safari page carries at least 500 words that appear on no other page, has no duplicated card text, and links to its sibling parks.
   - The template makes this possible and a check script measures it.
   - The criterion is met only once the owner's confirmed content is entered in admin. Until then it's reported as open, not claimed.
4. Everything is server-rendered and visible without JS. No page gains client JS it didn't need, and conversion surfaces lose framer-motion entrance animations.
5. **Nothing is invented.** Price, policy, times, pickup, private-jeep and season claims render only from admin fields on that package. Fixed copy describes the booking process (message, we reply within 24 hours, which is the site's existing promise), never the service. No schema property asserts a state such as availability that isn't in admin data.

**Assumptions (reviewer, challenge these):**
- A1: the brand stays. That means the logo, the jeep-green / dry-grass palette, and the DM Serif Display + Inter fonts. The rebrand is two months old, so this is a UX and layout revamp, not a new identity.
- A2: the content stays editable in the existing Mongo admin. It does not move to Sanity.
- A3: WhatsApp is the primary conversion. Phone is secondary, and the inquiry form is tertiary.

## 2. Approaches considered

| | Approach | For | Against |
|---|---|---|---|
| **A (chosen)** | Optional structured "landing" fields on the Mongo package, rendered by one designed template that shows a section only when its data exists | Owner-editable in the admin he already uses. Consistent pages. Sections degrade gracefully. Server-rendered and crawlable. | The admin form grows by one tab. |
| B | Move packages to Sanity blocks (like the blog) | Rich editor and image handling | `Inquiry.packageId` references Mongo ids, so migration is risky. Two CMSs for one catalogue. Far larger change. |
| C | Hard-code landing copy per package in TS/MDX | Fastest | The owner can't edit it. It drifts from admin data. It duplicates the `description` field. |

## 3. Design system (evolved, not replaced)

- **Tokens.** Keep `--primary` (jeep green), `--secondary` (dry grass), `--destructive` (sunset) and the neutrals in `app/globals.css`. Add:
  - `--whatsapp: oklch(0.5 0.12 158)` (≈#007748, **5.63:1** with white text) and `--whatsapp-hover: oklch(0.44 0.1 160)` (≈#00633f, 7.37:1), with `--whatsapp-foreground: oklch(0.99 0 0)`, exposed as `bg-whatsapp`, `hover:bg-whatsapp-hover` and `text-whatsapp-foreground`.
    - WhatsApp's own `#25D366` gives 1.98:1 with white text and fails WCAG AA, so we use a darker green in the same hue family, which still reads as WhatsApp next to the logo.
    - Hover darkens rather than lightens.
  - `--surface-sunken: oklch(0.935 0.012 100)` for alternating sections, replacing ad-hoc `bg-gray-50`.
- **Type.** DM Serif Display is for H1/H2 only and Inter is for everything else.
  - Replace the global `h1{text-5xl}` / `h2{text-4xl}` / `h3{text-3xl}` base styles with responsive sizes: h1 `text-4xl md:text-6xl`, h2 `text-3xl md:text-4xl`, h3 `text-xl md:text-2xl` (h3 moves to the sans face).
  - The global 5xl h1 is why long headings crowd phones today.
- **Button.** Add `variant: "whatsapp"` to `components/ui/button.tsx`. Every WhatsApp CTA uses it.
- **Radius.** Keep the sharp 0.25rem. It reads like a field guide, not an app. Cards use `rounded-lg`, and a card is used only where the item is a separate object: package cards and the booking panel.
- **Motion.** Remove entrance animations from the hero, cards, booking surfaces and forms. Keep hover transitions only, and respect `prefers-reduced-motion`.
- **Subject-specific signature.** A season strip: a 12-month row (J F M A M J J A S O N D) with each month marked *peak*, *good* or plain. This is the one thing every Minneriya, Kaudulla and Hurulu traveller asks ("when are the elephants there?"). It appears on safari cards and landing pages, and in the homepage park chooser. It renders only when the admin sets months.

## 4. Content model (Mongo `Package`, all optional, additive)

These build on fields that lead-recovery Tasks 2–4 already add: `previousSlugs`, `category`, `sortOrder`, `priceFrom`, `priceCurrency`, `priceUnit`, `priceNote`.

| Field | Type | Limits | Used for |
|---|---|---|---|
| `summary` | string | ≤ 220 chars | Card text and the hero subtitle. It replaces card text truncated from `description`. |
| `seoTitle` | string | ≤ 70 | `<title>`. Fallback: `buildPackageTitle(name)`. |
| `seoDescription` | string | ≤ 160 | Meta description. Fallback: `truncateAtWord(summary ?? description)`. |
| `groupSize` | string | ≤ 60 | Fact chip, e.g. "Up to 6 per jeep". It replaces the hard-coded "1-6 people per jeep". |
| `highlights` | string[] | ≤ 8 × 140 | "Why this safari" list. |
| `notIncluded` | string[] | ≤ 12 × 140 | Next to Included. |
| `timeSlots` | string[] | ≤ 4 × 40 | Chips, e.g. "6:00 am", "2:30 pm". |
| `pickupAreas` | string[] | ≤ 10 × 60 | Pickup section and chip ("Hotel pickup"). |
| `whatToBring` | string[] | ≤ 10 × 100 | Checklist. |
| `itinerary` | `{time?, title, detail?}[]` | ≤ 10 | Timeline. |
| `faqs` | `{question, answer}[]` | ≤ 10 | Package FAQ, answers server-rendered. |
| `imageAlts` | `{src, alt}[]`, stored with URLs as values since Mongo keys can't contain dots | ≤ 30; `src` is a URL, `alt` 1–150 chars | Meaningful alt text per photo, **keyed by image URL** so gaps, reordering and removal can never mislabel a photo. The serializer exposes `Record<src, alt>` for images still present. The admin edits one input beside each photo. Fallback: `${name}, photo n`. |
| `season` | `{peak: number[], good: number[]}` | months 1–12, unique, disjoint | Season strip. |

**Category fallback.** Every live package has `category` unset today. `inferCategory(slug, name)` gives an explicit, tested keyword fallback, applied in the serializer only when `category` is null:
- `safari` → safari;
- `village|cooking|culinary` → experience;
- `cottage|room|stay|hotel` → stay;
- `tour` → tour;
- anything else → uncategorised.

It covers all 11 live slugs and the 5 dev slugs correctly (unit-tested with both lists). The admin's explicit category always wins. Launch still asks the owner to set categories, but the homepage never ships without a park chooser.

**Season normalisation.** `normalizeSeason` drops months outside 1–12, removes duplicates, and removes good-months that are also peak. It runs in the serializer, so every consumer sees clean data, and "does this package have a season" is one check.

Validation lives in the Zod `packageSchema`. Every field is `.nullable().optional()`, following the Task 3 pattern. `serializePackage` maps `null` to `undefined` and empty arrays to `undefined`, so templates test with a plain truthiness check.

**Admin editing.** The package dialog gets a new "Landing page" tab:
- List fields are textareas, one item per line.
- Itinerary lines use the format `time | title | detail`.
- FAQs are blocks separated by a blank line: the first line is the question, the rest is the answer.
- Season is a 12-month picker where each month cycles off → good → peak.
- Parsing and formatting are pure functions with tests. It's the least UI code that's still explicit, and the admin page is already 583 lines with a refactor TODO.

## 5. Pages

### 5.1 Global chrome

- **Navbar.**
  - Desktop: nav links plus a `whatsapp` "WhatsApp us" button, replacing "Send Inquiry".
  - Mobile: logo, a call icon and the menu. Inside the menu, WhatsApp comes first and "Send an inquiry" second.
- **`MobileContactBar`** (new, `lg:hidden`, aligned with the navbar's `lg` breakpoint, so 768–1023 px is covered).
  - Shows WhatsApp (primary) and Call. On package pages it also shows the price, or "Price on request", and WhatsApp is prefilled with the package.
  - It uses **`position: sticky; bottom: 0`** as the last child of the page's `<main>`, not `fixed` with a guessed spacer. While you scroll it stays at the viewport's bottom. At the end of `<main>` it settles into its own space just above the footer, so it can never cover the footer or the last content, whatever its height (price wrapping, 125% text, safe-area inset).
  - Pages include it explicitly: home, packages, package detail, blog index, blog post, contact and book-now.
  - The floating "Chat with us" bubble is removed.
- **Footer.** Stays, with tel/WhatsApp links fixed.

### 5.2 Homepage (`app/(main)/page.tsx`)

Sections, in order:

1. **Hero** (content-sized; no viewport height).
   - Photo: the Minneriya tank herd (`1_s6q0hr`), with a dark gradient for legible text.
   - H1: "Jeep safaris from Habarana", with an eyebrow line "Minneriya · Kaudulla · Hurulu Eco Park".
   - Lead: "Message us your date and hotel. We'll reply within 24 hours with the park, the time and the current price." This describes the process only, not the service.
   - Trust line, then WhatsApp and Call side by side.
   - **Park quick-picks.** One compact row per safari (name → its page, duration, price or "Price on request"), from the same data as the chooser.
   - This is what makes the first viewport answer what, duration, price, trust and WhatsApp (criterion 1). If there are no safaris, the rows are omitted.
2. **Choose your park.**
   - One card per safari (explicit or inferred category), in display order. Each card shows its image, name, summary, season strip, duration, price-from or "Price on request", "View details", and a WhatsApp link.
   - Followed by: "Not sure which park? Send us your dates and we'll recommend one."
3. **Real guests.**
   - A 4-photo strip of guest jeep photos (`IMG_8961`, `IMG_0422`, `IMG_8953`, `cover_yulgqs`).
   - The static trust line, then the existing Elfsight reviews widget (lazy).
4. **How booking works.** Three real steps that describe only the process: *Message us your date and hotel* → *We reply within 24 hours with the park, time, price and pickup details* → *Confirm and meet your guide*. The note reads "No payment needed to ask", which is literally true of an inquiry. This replaces `PlanVisitSection`.
5. **More experiences.** Non-safari packages as the standard package card (reused for consistency; no separate compact variant).
6. **FAQ.** The safari set (Task 6).
7. **Travel guides.** The existing featured blogs, moved lower.
8. **Final CTA band.** WhatsApp and Call. The copy is generic ("Planning your trip to Habarana?"), and the title is overridable per page, so cooking and stay pages never promise a park or elephants.

Removed: `FeaturesSection` (four generic claims with big alternating images), `PlanVisitSection` and `CTABannerSection`.

### 5.3 Package landing page (`app/(main)/packages/[id]`)

Mobile order, top to bottom. On desktop, a two-column layout with a sticky booking panel on the right.

1. **Gallery.** One server-rendered list whose layout changes by breakpoint. On mobile it's a 16:9 scroll-snap strip of at most 8 photos, which keeps the first viewport for the decision facts. On desktop it's a mosaic of one large image and up to four tiles.
   - The lead image is rendered once with `priority`, with no duplicate hidden copy.
   - Alt text comes from `imageAlts[src]` (URL-keyed), falling back to `${name}, photo n`.
   - No autoplay, no framer-motion. It replaces `ImageGallery`.
2. **Header.**
   - H1 = `name`, then a price line (price or "Price on request").
   - The trust line.
   - Fact chips: duration, groupSize, time slots, "Hotel pickup" (when `pickupAreas` is set; no "free" claim).
   - Inline WhatsApp and Call.
   - `summary` goes after the CTAs.
   - The breadcrumb moves below the header on mobile and sits above it on desktop.
3. **Booking panel.**
   - Price-from via `formatPrice`, or "Price on request · reply within 24 hours".
   - The `priceNote`.
   - WhatsApp (prefilled with the package) and Call buttons.
   - A "Prefer email? Send an inquiry form" link.
   - Reassurance: "No payment needed to ask". There's no fixed "private jeep" claim; `groupSize` carries that when the admin sets it.
   - It's desktop only (sticky right column). On mobile, the header's inline CTAs plus the contact bar replace it.
5. Highlights.
6. Season strip, with the heading "When to go".
7. Itinerary timeline.
8. Included / Not included.
9. Pickup & times.
10. What to bring.
11. "About this experience": `description`, split into paragraphs on blank lines.
12. Package FAQs.
13. **Related.** `selectRelatedPackages` (Task 4), showing sibling safaris first.
14. Final CTA band.
15. `MobileContactBar` with the price and package.

Sections 5–12 render only when their data exists. "Pickup and start times" says "Hotel pickup from", never "free".

JSON-LD keeps `Service` and adds `offers` from `buildOffer` (price, currency, url, description). There is **no `availability`**: price doesn't establish it, and the data has no availability source. The breadcrumb stays.

### 5.4 Packages listing (`/packages`)

A compact header, then sections grouped by category (explicit or inferred) in this order: safari → experience → tour → stay → uncategorised ("More tours").
- Each section shows a heading, a one-line **neutral** intro and a grid of the redesigned cards. An intro names the category ("Jeep safaris to Minneriya, Kaudulla and Hurulu Eco Park.") and makes no claims about activities, meals or guides.
- Empty groups are skipped.

### 5.5 Package card (`components/ui/package-card.tsx`)

- The image and title are one link, with a duration badge on the image.
- Below: summary (2-line clamp), season strip (safari only), price-from or "Price on request".
- Then a "View details" link and a separate small WhatsApp link. They are siblings, never nested.
- The card no longer renders the `included` list or full descriptions, which removes the 90% duplicated text from every package page.

### 5.6 Book-now, contact, blog post

- **Book-now.**
  - The page reads `searchParams.packageId` on the server. `resolveInitialPackageId` accepts it only if it's a valid id **of a current package**; a stale id from an old link becomes "". The result goes in as a prop, so `BookingForm` no longer calls `useSearchParams` and renders fully on the server.
  - A "Fastest: WhatsApp us" block goes above the form.
  - The form loses its `opacity: 0` mount.
- **Contact.** The phone becomes a `tel:` link and the `opacity: 0` mount goes.
- **Blog post.** A "Planning a safari from Habarana?" CTA block before the comments.

## 6. Components and boundaries

| Unit | Kind | Depends on | Tested by |
|---|---|---|---|
| `lib/contact-links.ts` | pure | `siteConfig` | unit |
| `lib/pricing.ts` | pure | `package-catalog` types | unit |
| `lib/season.ts` (`buildSeasonCells`, `MONTH_LABELS`) | pure | — | unit |
| `lib/package-landing.ts` (parse/format for the admin fields, `splitParagraphs`) | pure | — | unit |
| `lib/package-catalog.ts` (+`groupPackagesByCategory`) | pure | — | unit |
| `components/common/contact-actions.tsx` | server | contact-links | SSR markup |
| `components/common/trust-line.tsx` | server | `siteConfig.reviews` | SSR markup |
| `components/common/mobile-contact-bar.tsx` | server | contact-links, pricing | SSR markup |
| `components/packages/season-strip.tsx` | server | season | SSR markup |
| `components/packages/package-gallery.tsx` | server | next/image | SSR markup |
| `components/packages/landing-sections.tsx` | server | — | SSR markup (sections omit when empty) |
| `components/packages/booking-panel.tsx` | server | contact-actions, pricing | SSR markup |
| `components/admin/package-landing-fields.tsx` | client | package-landing | typecheck + manual |
| `components/admin/season-picker.tsx` | client | season | typecheck + manual |

SSR markup tests use `react-dom/server` `renderToStaticMarkup` under Vitest, which is already set up.

## 7. Error handling and edge cases

- **A package with no landing data** (every package today) renders: gallery, header, booking panel with "Price on request", included, about, related, CTA. It must look complete, not broken.
- **A package with no images** shows the existing placeholder tile. No layout shift.
- **A price without a unit or currency** can't be saved (Task 3 refinement). A legacy record with one missing renders "Price on request".
- **Season arrays** with out-of-range or overlapping months are rejected by Zod. The strip ignores anything invalid defensively.
- **Admin textareas:** blank lines and whitespace-only lines are dropped. A malformed itinerary line (no `|`) becomes `{title: line}`. The FAQ parser drops a block with no answer and reports its count in the UI.
- **WhatsApp prefill:** package names with `&`, quotes or trailing spaces are handled by `buildWhatsAppUrl` (tested).
- **JS disabled:** every section, FAQ answer and CTA is present in server HTML. CTAs are plain links.

## 8. Testing

- Unit tests for every pure module above, plus SSR markup tests for every server component. Each SSR test asserts:
  - the section is omitted when its data is empty;
  - there's no `<a>` wrapping a `<button>`;
  - there's no `opacity:0`.
- Whole-branch gates: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`, then `curl` checks against `pnpm start`. Occurrence counts use `grep -o … | wc -l`, not `grep -c`.
- **Browser checks.** `scripts/verify-layout.mjs` drives headless Chrome over the DevTools protocol with no new dependencies; Node 26 ships `WebSocket`. It emulates a 390×844 phone and 1024/1280 desktops and asserts:
  - the first-viewport facts from criterion 1;
  - no horizontal overflow;
  - the footer's last link and the last FAQ are not covered by the bar at scroll end, both at 100% and at 125% root font size;
  - on `/book-now?packageId=…`, the selected package shows in the form;
  - the lead image is requested exactly once, with the count of image requests on first load reported.
  - It runs on: home, a package with no landing data, a package with full landing data (dev DB), and the longest-named package.
- **Content gate report.** `scripts/landing-word-report.mjs` prints, per safari page, the words that appear on no other package page. Advisory until the owner's content is in.

## 9. Out of scope

- Analytics (PostHog), pending the client.
- Writing final landing copy into the production DB (the user does admin edits). A copy draft for the 5 core packages is delivered as `docs/content/package-landing-drafts.md`, built only from existing site and blog text. Each package has two blocks:
  - **Paste-ready:** only statements that already appear in live copy, with no markers.
  - **Needs owner confirmation:** every price, time, ticket, pickup and season fact, plus contradictions between sources, as a question list, never mixed into paste-ready text.
- A new logo or brand identity. A booking engine or payments. A move to Sanity.
