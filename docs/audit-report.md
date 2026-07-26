# Ceylon Safari repository audit

Updated: 27 July 2026

## Executive summary

The application is now on Next.js 16, React 19, Node.js 24, and pnpm. Public
package and blog content is rendered into crawlable HTML, the rebrand is
centralized on `https://www.ceylonsafari.com`, duplicate blog pages are
consolidated, security boundaries are enforced on the server, and both the
production and full dependency audits report zero known vulnerabilities. The
audited commit is live on the canonical production domain.

The remaining high-impact work is outside this repository: retain control of
the former domain and attach it to the Vercel project, update the Google
Business Profile name and website, configure Search Console migration signals,
and create a working branded mailbox. Those actions require account ownership
or business confirmation.

## Architecture

- Next.js App Router serves the marketing site, package pages, inquiry flow,
  and authenticated admin.
- MongoDB stores packages, inquiries, users, reset tokens, rate limits, and
  inquiry idempotency keys.
- Sanity stores posts, authors, categories, comments, and article SEO fields.
- Cloudinary and Sanity CDN host media.
- NextAuth protects admin routes and APIs.
- Nodemailer sends inquiry and password-reset email.
- Elfsight loads Google review content after the main page becomes interactive.

## Findings and status

### High

| Finding | Status |
| --- | --- |
| Old and new names/domains were mixed across metadata, schema, email, assets, and visible copy. | Fixed in code and content. Former names remain only where they help entity reconciliation. |
| Canonical URLs could resolve to the old domain or cause every page to inherit the homepage canonical. | Fixed with page-specific canonicals and one `www` origin. |
| The old domain did not resolve during the audit, so it cannot currently pass search equity. | Redirect rules are implemented and path-preserving, but the domain must be renewed/configured and attached to Vercel. |
| Public blog/package content depended on client fetching, weakening crawlability and adding loading work. | Fixed with cached Server Components and partial prerendering. |
| Admin/API authorization and reset flows had server-boundary weaknesses. | Fixed with server-side admin gates, bounded validation, safer resets, and request limits. |
| The inquiry endpoint lacked durable global throttling and idempotency. | Fixed with MongoDB-backed rate limits and idempotency keys. |
| Dependency audit findings included Nodemailer and transitive build/runtime packages. | Fixed. Full and production audits are both zero. Patched transitive versions are locked with pnpm overrides. |
| A Sanity webhook secret appeared during the audit session. | Rotate the secret in Sanity and Vercel immediately. The value is not tracked by Git. |

### Medium

| Finding | Status |
| --- | --- |
| Four Habarana articles competed for the same intent and contained weak or outdated copy. | Consolidated to `/blogs/habarana-jeep-safari`; three old slugs now return permanent redirects and are retained as `noIndex` recovery copies. |
| CMS authors were keyword-like entities or the former brand. | All posts now reference `Ceylon Safari Editorial Team`; Article schema identifies Ceylon Safari as the Organization author/publisher. |
| Package, article, breadcrumb, local business, and website schemas were incomplete. | Added and rendered server-side with stable IDs and exact NAP/geo data. |
| Several page-level Open Graph objects silently removed the inherited image. | Fixed and verified in a real browser. |
| The Google reviews widget was blocked by CSP. | The exact Elfsight script/CDN origins are now allowed; the widget remains lazy-loaded. |
| Decorative animation wrappers forced static marketing content into client bundles. | Removed from the hero, cards, headings, planning, CTA, features, FAQ wrappers, navigation, and WhatsApp CTA. |
| Form errors exposed implementation-oriented messages and were not live regions. | Reworded package/group errors and added accessible alert semantics. |
| Client validation errors were logged as server failures. | Expected validation/operational errors no longer produce error stack noise. |

### Low or informational

- The active Facebook, Instagram, and TikTok URLs still use former-brand
  handles. Keep the URLs until the accounts themselves are renamed; then update
  `config/site.ts`.
- Cloudinary URLs contain the legacy account identifier. This is infrastructure,
  not customer-facing brand copy, and must not be renamed without a media
  migration.
- `ceylonsafari.lk` is a separate Habarana operator with a different address
  and phone number. It must not be linked in `sameAs`. Consistent NAP data is
  particularly important to distinguish the businesses.
- TypeScript 7 and ESLint 10 are published, but the current Next.js
  `typescript-eslint` toolchain cannot run with them. The repository uses the
  latest compatible TypeScript 6 and ESLint 9 releases; all other eligible
  direct dependencies are current.

## Rendering and revalidation strategy

| Content | Strategy | Reason |
| --- | --- | --- |
| Marketing pages | Static shell with cached server data | Content is stable and should arrive as complete HTML. |
| Packages | Server-rendered, one-hour revalidation, one-week expiry, tag/path invalidation after admin writes | Package changes are occasional but should publish without a full rebuild. |
| Blog index | Partial prerendering with server-rendered URL filters and pagination | The base page is crawlable while query-specific views remain dynamic and `noindex`. |
| Blog articles | Cached server rendering, one-hour revalidation, Sanity webhook invalidation | Articles need fast global delivery and prompt editorial updates. |
| Inquiry/API routes | Dynamic and uncached | User-specific writes must never be served from cache. |
| Admin | Dynamic request-time authentication inside partial shells | Static admin chrome is reusable; protected data is not. |
| Sitemap | Cached for one hour and invalidated with content | Avoids database work on every request without publishing stale URLs indefinitely. |

Cache Components are used where content reuse is real. Streaming boundaries
cover blog search/results and authenticated admin content. No blanket SSR mode
is applied.

## SEO and entity work completed

- Centralized brand, origin, NAP, coordinates, contact details, service areas,
  former names, Google Maps URL, and active social profiles.
- Added `TravelAgency` and `WebSite` entity graphs.
- Added `Service` schema to packages and `BlogPosting` schema to articles.
- Added breadcrumbs to package and article detail pages.
- Rebuilt robots and sitemap output from canonical data sources.
- Added page-specific title, description, canonical, Open Graph, Twitter, and
  robots metadata.
- Added CMS fields and validation for SEO descriptions, social images,
  alternative text, categories, authorship, and `noIndex`.
- Removed H1 from the portable-text editor so each page retains one primary H1.
- Made blog filtering/pagination URL-based and server-rendered.
- Added local links and exact NAP details to the footer and contact page.
- Rewrote the privacy policy to match the data the application actually stores.

## Verification completed

- `pnpm install` passes the repository supply-chain policy.
- `pnpm typecheck` passes.
- `pnpm lint` has no errors. Remaining warnings are React Compiler opt-outs or
  legacy admin hook patterns; they do not fail the gate.
- `pnpm build` passes with Cache Components enabled.
- `pnpm audit` and `pnpm audit --prod` both report zero vulnerabilities.
- Sanity schema validation reports zero errors and zero warnings.
- Desktop and mobile browser checks show no error overlay, no console errors,
  one H1 per verified page, no missing image alternative text, and no
  horizontal mobile overflow.
- Removing decorative client animation reduced the measured homepage JavaScript
  payload from about 308 KB to 277 KB gzip (roughly 10%). The rendered HTML is
  about 29 KB gzip. A warmed local production request measured about 105 ms
  TTFB; real-user timings depend on the deployment region and visitor network.
- Empty inquiry submission is blocked client-side, and invalid API input
  returns HTTP 400.
- Admin pages redirect unauthenticated requests to login.
- Security headers, duplicate-article redirects, old-host redirects, robots,
  sitemap, canonical URLs, and JSON-LD were verified against a production
  server build.
- The live `https://www.ceylonsafari.com` deployment returns HTTP 200 for the
  homepage, robots, sitemap, blog index, and canonical Habarana article. It
  returns HTTP 308 for all three consolidated article slugs and HTTP 307 from
  protected admin pages to login.
- Live desktop and 390 px mobile checks confirm the canonical origin, one H1,
  complete image alternative text, no horizontal overflow, the Google reviews
  widget, and no browser console or CSP errors. The canonical Habarana article
  exposes `TravelAgency`, `WebSite`, `BlogPosting`, and `BreadcrumbList`
  structured data.

Local browser measurements are useful for regression checks, not field Core Web
Vitals. Use Search Console field data to judge LCP, INP, and CLS over the next
28 days.

## Human decisions and external actions

1. Confirm ownership and renewal status of `travelhabarana.com`. Attach both
   apex and `www` to the same Vercel project so the implemented path-preserving
   permanent redirects can operate.
2. Rename the Google Business Profile to **Ceylon Safari**, set the website to
   `https://www.ceylonsafari.com`, and confirm the public NAP remains:
   `Anuradhapura Road, Habarana 50150`, `+94 76 667 5883`.
3. Confirm that “Open 24 hours” means guests can contact or book at any time.
   The schema currently mirrors the supplied Google listing.
4. Confirm the insurance and seatbelt inclusions shown in individual package
   records. The unverified homepage insurance claim was removed.
5. Set up MX records and a real mailbox such as `info@ceylonsafari.com`, then
   change `EMAIL_FROM` and the public contact email. DNS had no working mail
   configuration during the audit, so the existing Gmail address is retained.
6. Rotate `SANITY_WEBHOOK_SECRET` in both Sanity and Vercel.
7. Verify the new domain in Search Console, submit the sitemap, monitor
   indexing/canonical reports, and use Change of Address only after the old
   domain redirects are live.
8. Decide whether future editorial investment should prioritize dedicated
   Minneriya, Kaudulla, Hurulu, Habarana, and village/cooking landing pages.
   Create them only when each page can answer a distinct traveler intent with
   original local information.
