import { Input, Label, clx } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"

export type TextAutocompleteProps = {
  value: string
  onChange: (value: string) => void
  fetchSuggestions: (query: string) => Promise<string[]>
  placeholder?: string
  label?: string
  required?: boolean
  id?: string
  disabled?: boolean
}

const DEBOUNCE_MS = 300

/**
 * Free-form text input with autocomplete suggestions fetched on type.
 *
 * Unlike a Select, the user CAN enter a value not present in the suggestion
 * list — suggestions exist only to surface what's already in the catalog
 * (manufacturer, homologation, ball_type, body_type).
 *
 * Brief #2 §9. Suggestions endpoint contract: `(query) => Promise<string[]>`.
 */
export const TextAutocomplete = ({
  value,
  onChange,
  fetchSuggestions,
  placeholder,
  label,
  required,
  id,
  disabled,
}: TextAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setSuggestions([])
      return
    }

    const handle = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(value)
        setSuggestions(results)
        setHighlightIndex(-1)
      } catch {
        setSuggestions([])
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(handle)
  }, [value, isOpen, fetchSuggestions])

  useEffect(() => {
    const onDocumentClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocumentClick)
    return () => document.removeEventListener("mousedown", onDocumentClick)
  }, [])

  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault()
      const picked = suggestions[highlightIndex]
      if (picked) handleSelect(picked)
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-1" ref={containerRef}>
      {label && (
        <Label htmlFor={id} className="text-ui-fg-subtle">
          {label} {required && <span className="text-ui-fg-error">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
        />
        {isOpen && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-ui-border-base bg-ui-bg-base shadow-lg"
          >
            {suggestions.map((suggestion, idx) => (
              <li
                key={suggestion}
                role="option"
                aria-selected={idx === highlightIndex}
                className={clx(
                  "cursor-pointer px-3 py-2 text-sm",
                  idx === highlightIndex
                    ? "bg-ui-bg-base-hover text-ui-fg-base"
                    : "text-ui-fg-subtle hover:bg-ui-bg-base-hover",
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(suggestion)
                }}
                onMouseEnter={() => setHighlightIndex(idx)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
