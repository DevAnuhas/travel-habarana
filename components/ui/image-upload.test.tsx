// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MotionGlobalConfig } from "framer-motion"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ImageUpload } from "./image-upload"

// Exit animations would keep removed items in the DOM, and happy-dom rejects
// the animations framer-motion cancels. Order is what is under test, not motion.
MotionGlobalConfig.skipAnimations = true

const B = "https://res.cloudinary.com/demo/image/upload/v2/b.jpg"
const A = "https://res.cloudinary.com/demo/image/upload/v1/a.jpg"
const C = "https://res.cloudinary.com/demo/image/upload/v3/c.jpg"

// Holds the array the way React Hook Form does: the same reference is handed
// back as `value` until onChange replaces it.
function Harness({
  initial,
  onValue,
}: {
  initial: string[]
  onValue: (urls: string[]) => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <ImageUpload
      value={value}
      onChange={(urls) => {
        setValue(urls)
        onValue(urls)
      }}
    />
  )
}

const previewOrder = () =>
  screen
    .getAllByRole("img", { name: "Preview" })
    .map((img) =>
      [A, B, C].find((url) =>
        decodeURIComponent(img.getAttribute("src") ?? "").includes(url)
      )
    )

afterEach(cleanup)

describe("ImageUpload", () => {
  // The first image is the lead photo on the site. Sorting the form's own
  // array in place used to swap it for whichever URL sorts first.
  it("opens with the saved order and leaves the form value untouched", async () => {
    const initial = [B, A]
    const emitted = vi.fn()
    render(<Harness initial={initial} onValue={emitted} />)
    await act(async () => {})

    expect(initial).toEqual([B, A])
    expect(previewOrder()).toEqual([B, A])
    for (const [urls] of emitted.mock.calls) expect(urls).toEqual([B, A])
  })

  it("does not emit an empty list while it loads saved images", async () => {
    const emitted = vi.fn()
    render(<Harness initial={[B, A]} onValue={emitted} />)
    await act(async () => {})

    expect(emitted).not.toHaveBeenCalledWith([])
  })

  it("emits the new order when an image is moved", async () => {
    const emitted = vi.fn()
    render(<Harness initial={[B, A, C]} onValue={emitted} />)
    await act(async () => {})

    fireEvent.click(screen.getByRole("button", { name: "Move image 1 down" }))
    await act(async () => {})

    expect(emitted).toHaveBeenLastCalledWith([A, B, C])
    expect(previewOrder()).toEqual([A, B, C])
  })

  it("emits the list without an image that is removed", async () => {
    const emitted = vi.fn()
    render(<Harness initial={[B, A, C]} onValue={emitted} />)
    await act(async () => {})

    fireEvent.click(screen.getByRole("button", { name: "Remove image 2" }))
    await act(async () => {})

    expect(emitted).toHaveBeenLastCalledWith([B, C])
  })

  it("shows a different package's images in their saved order after a reset", async () => {
    const onChange = vi.fn()
    const view = render(<ImageUpload value={[B, A]} onChange={onChange} />)
    await act(async () => {})

    const next = [C, A]
    view.rerender(<ImageUpload value={next} onChange={onChange} />)
    await act(async () => {})

    expect(next).toEqual([C, A])
    expect(previewOrder()).toEqual([C, A])
  })
})
