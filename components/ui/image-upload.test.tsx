// @vitest-environment happy-dom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { MotionGlobalConfig } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ImageUpload } from "./image-upload"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

// Exit animations would keep removed items in the DOM, and happy-dom rejects
// the animations framer-motion cancels. Order is what is under test, not motion.
MotionGlobalConfig.skipAnimations = true

const B = "https://res.cloudinary.com/demo/image/upload/v2/b.jpg"
const A = "https://res.cloudinary.com/demo/image/upload/v1/a.jpg"
const C = "https://res.cloudinary.com/demo/image/upload/v3/c.jpg"
const D = "https://res.cloudinary.com/demo/image/upload/v4/d.jpg"

// Holds the array the way React Hook Form does: the same reference is handed
// back as `value` until onChange replaces it, and a reset hands over a new
// array (form.reset() runs after every save, while the dialog animates shut).
function Harness({
  initial,
  onValue,
  resetTo = [],
}: {
  initial: string[]
  onValue: (urls: string[]) => void
  resetTo?: string[]
}) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <button type="button" onClick={() => setValue([...resetTo])}>
        Reset form
      </button>
      <ImageUpload
        value={value}
        onChange={(urls) => {
          setValue(urls)
          onValue(urls)
        }}
      />
    </>
  )
}

const previewOrder = () =>
  screen
    .queryAllByRole("img", { name: "Preview" })
    .map((img) =>
      [A, B, C, D].find((url) =>
        decodeURIComponent(img.getAttribute("src") ?? "").includes(url)
      )
    )

const resetForm = () =>
  act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Reset form" }))
  })

// Cloudinary upload stand-in: the test decides when (and whether) it finishes.
class FakeXhr {
  static instances: FakeXhr[] = []
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
    onprogress: null,
  }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  ontimeout: (() => void) | null = null
  onabort: (() => void) | null = null
  status = 0
  responseText = ""
  timeout = 0
  aborted = false
  open = vi.fn()
  send = vi.fn()
  constructor() {
    FakeXhr.instances.push(this)
  }
  abort() {
    this.aborted = true
    this.onabort?.()
  }
  respond(status: number, body: unknown) {
    this.status = status
    this.responseText = JSON.stringify(body)
    this.onload?.()
  }
}

const SIGNATURE = {
  apiKey: "key",
  timestamp: 1,
  signature: "signature-value",
  uploadPreset: "preset",
  cloudName: "demo",
}

function stubSignature() {
  let release = () => {}
  const ready = new Promise<void>((resolve) => (release = resolve))
  const fetchMock = vi.fn(async () => {
    await ready
    return { ok: true, json: async () => SIGNATURE }
  })
  vi.stubGlobal("fetch", fetchMock)
  vi.stubGlobal("XMLHttpRequest", FakeXhr)
  return {
    fetchMock,
    release: () => act(async () => release()),
  }
}

async function dropImage(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]')
  if (!input) throw new Error("no file input")
  const file = new File(["x"], "d.png", { type: "image/png" })
  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } })
  })
}

const everEmitted = (emitted: ReturnType<typeof vi.fn>, url: string) =>
  emitted.mock.calls.some(([urls]) => (urls as string[]).includes(url))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.clearAllMocks()
  FakeXhr.instances = []
})

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

  // Same photos, new order: the form saves the reset's cover photo, so the
  // previews must show that one first, not the order we displayed before.
  it("follows a form reset that only changes the order", async () => {
    const emitted = vi.fn()
    render(<Harness initial={[B, A]} onValue={emitted} resetTo={[A, B]} />)
    await act(async () => {})

    await resetForm()

    expect(previewOrder()).toEqual([A, B])
    expect(emitted).not.toHaveBeenCalled()
  })
})

describe("ImageUpload uploads", () => {
  it("appends a finished upload and reports one success", async () => {
    const { release } = stubSignature()
    const emitted = vi.fn()
    const { container } = render(<Harness initial={[B, A]} onValue={emitted} />)

    await dropImage(container)
    await release()
    await waitFor(() => expect(FakeXhr.instances).toHaveLength(1))
    await act(async () => FakeXhr.instances[0].respond(200, { secure_url: D }))

    expect(emitted).toHaveBeenLastCalledWith([B, A, D])
    expect(previewOrder()).toEqual([B, A, D])
    expect(toast.success).toHaveBeenCalledWith("Successfully uploaded 1 image(s)")
  })

  // Each upload catches its own error, so counting settled promises used to
  // report every failure as a success too.
  it("does not report a failed upload as a success", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {})
    const { release } = stubSignature()
    const emitted = vi.fn()
    const { container } = render(<Harness initial={[B]} onValue={emitted} />)

    await dropImage(container)
    await release()
    await waitFor(() => expect(FakeXhr.instances).toHaveLength(1))
    await act(async () => FakeXhr.instances[0].respond(500, {}))

    expect(logged).toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
    expect(emitted).not.toHaveBeenCalled()
  })

  it("drops an upload whose signature arrives after a form reset", async () => {
    const { fetchMock, release } = stubSignature()
    const emitted = vi.fn()
    const { container } = render(
      <Harness initial={[B, A]} onValue={emitted} resetTo={[C]} />
    )

    await dropImage(container)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    await resetForm()
    await release()

    expect(FakeXhr.instances).toHaveLength(0)
    expect(previewOrder()).toEqual([C])
    expect(emitted).not.toHaveBeenCalled()
    // Not stuck in the loading state from the abandoned request.
    expect(
      screen.getByText("Drag & drop images here, or click to select files")
    ).toBeTruthy()
  })

  it("aborts an in-flight upload on form reset and ignores its result", async () => {
    const { release } = stubSignature()
    const emitted = vi.fn()
    const { container } = render(
      <Harness initial={[B, A]} onValue={emitted} resetTo={[C]} />
    )

    await dropImage(container)
    await release()
    await waitFor(() => expect(FakeXhr.instances).toHaveLength(1))
    await resetForm()

    expect(FakeXhr.instances[0].aborted).toBe(true)
    // Even if a late load event still fired, the reset form must not change.
    await act(async () => FakeXhr.instances[0].respond(200, { secure_url: D }))
    expect(everEmitted(emitted, D)).toBe(false)
    expect(previewOrder()).toEqual([C])
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("aborts an in-flight upload silently when the form closes", async () => {
    const { release } = stubSignature()
    const { container, unmount } = render(
      <Harness initial={[B]} onValue={vi.fn()} />
    )

    await dropImage(container)
    await release()
    await waitFor(() => expect(FakeXhr.instances).toHaveLength(1))
    unmount()
    await act(async () => {})

    expect(FakeXhr.instances[0].aborted).toBe(true)
    expect(toast.error).not.toHaveBeenCalled()
  })
})
