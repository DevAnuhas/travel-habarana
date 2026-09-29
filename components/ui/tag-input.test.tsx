// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"

import { TagInput } from "./tag-input"

afterEach(cleanup)

it("names each remove button after its tag and removes that tag", () => {
  const onChange = vi.fn()
  render(<TagInput value={["Guide", "Jeep"]} onChange={onChange} />)

  fireEvent.click(screen.getByRole("button", { name: "Remove Jeep" }))

  expect(onChange).toHaveBeenCalledWith(["Guide"])
})
