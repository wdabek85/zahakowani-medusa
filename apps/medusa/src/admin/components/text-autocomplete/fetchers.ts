/**
 * Builds a `fetchSuggestions` function for the TextAutocomplete component
 * that hits one of the `/admin/autocomplete/*` endpoints.
 *
 * Endpoints return `{ suggestions: string[] }` — we unwrap to a plain array
 * before handing to the component.
 *
 * Brief #2 §9.
 */
type AutocompleteFieldKind = "manufacturers" | "homologations" | "ball-types" | "body-types"

export const createAutocompleteFetcher = (field: AutocompleteFieldKind) => {
  return async (query: string): Promise<string[]> => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    const response = await fetch(`/admin/autocomplete/${field}?${params.toString()}`, {
      credentials: "include",
    })
    if (!response.ok) return []
    const body = (await response.json()) as { suggestions?: string[] }
    return body.suggestions ?? []
  }
}
