import { revalidatePath, revalidateTag } from "next/cache"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { revalidatePackages } from "./package-revalidation"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

const paths = () => vi.mocked(revalidatePath).mock.calls.map(([path]) => path)

beforeEach(() => vi.clearAllMocks())

describe("revalidatePackages", () => {
  // "max" would serve the old entry to one more visitor: a price the admin
  // just cleared would still show. Corrections must land on the next request.
  it("expires cached package data immediately", () => {
    revalidatePackages("hurulu")
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("package", {
      expire: 0,
    })
  })

  it("refreshes the listing, the sitemap and each package page once", () => {
    revalidatePackages("old-slug", "new-slug", "new-slug")
    expect(paths().sort()).toEqual(
      [
        "/packages",
        "/packages/new-slug",
        "/packages/old-slug",
        "/sitemap.xml",
      ].sort()
    )
  })

  it("skips missing slugs", () => {
    revalidatePackages(undefined, null, "")
    expect(paths().sort()).toEqual(["/packages", "/sitemap.xml"])
  })
})
