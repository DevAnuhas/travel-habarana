"use client"

import { useState } from "react"

import { Textarea } from "@/components/ui/textarea"

interface LinesTextareaProps<T> {
  id: string
  value: T | null | undefined
  format: (value: T | null | undefined) => string
  parse: (text: string) => T
  isEmpty: (value: T) => boolean
  onChange: (value: T | null) => void
  placeholder?: string
  rows?: number
}

/**
 * Keeps the raw text locally so a typed newline is never reformatted away
 * mid-edit; pushes the parsed value up on every change, and null when empty.
 */
export function LinesTextarea<T>({
  id,
  value,
  format,
  parse,
  isEmpty,
  onChange,
  placeholder,
  rows = 4,
}: LinesTextareaProps<T>) {
  const [text, setText] = useState(() => format(value))
  return (
    <Textarea
      id={id}
      rows={rows}
      value={text}
      placeholder={placeholder}
      onChange={(event) => {
        setText(event.target.value)
        const parsed = parse(event.target.value)
        onChange(isEmpty(parsed) ? null : parsed)
      }}
    />
  )
}
