import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges className values with Tailwind conflict resolution.
 *
 * Use everywhere instead of plain template string concat — it dedupes
 * conflicting Tailwind utilities (e.g. `cn("p-2", "p-4")` → `"p-4"`)
 * and handles conditional classes via clsx semantics.
 *
 * Pattern matches shadcn/ui standard.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
