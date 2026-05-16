/**
 * Deduplicates, filters by case-insensitive substring match and sorts.
 * Used by all 4 autocomplete endpoints to return suggestion lists.
 */
export function filterUniqueSuggestions(
  values: ReadonlyArray<string | null | undefined>,
  query: string | undefined,
  limit = 20,
): string[] {
  const q = (query ?? "").toLowerCase().trim()
  const seen = new Set<string>()
  const matched: string[] = []

  for (const v of values) {
    if (!v) continue
    if (seen.has(v)) continue
    if (q && !v.toLowerCase().includes(q)) continue
    seen.add(v)
    matched.push(v)
  }

  return matched.sort((a, b) => a.localeCompare(b, "pl")).slice(0, limit)
}
