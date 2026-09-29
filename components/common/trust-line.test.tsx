import { renderToStaticMarkup } from "react-dom/server"
import { expect, it } from "vitest"

import { TrustLine } from "./trust-line"

it("shows the Google rating and review count, links to the listing, and is findable by checks", () => {
  const html = renderToStaticMarkup(<TrustLine />)
  expect(html).toContain("5.0")
  expect(html).toContain("27 Google reviews")
  expect(html).toContain('href="https://maps.app.goo.gl/jtjd3mUANDnH3rRu5"')
  expect(html).toContain("data-trust")
})
