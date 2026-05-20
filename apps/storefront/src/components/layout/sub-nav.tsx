import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { NAV_CATEGORIES } from "./nav-data"

/**
 * SubNav — drugi biały pasek pod Header'em z linkami kategorii
 * (Figma node 403:1721, trzecia warstwa).
 *
 * Desktop only — na mobile (<md) zwija się w hamburger menu (`MobileMenu`).
 *
 * TODO(wiring): linki kategorii z `NAV_CATEGORIES` — strony kategorii nie
 * istnieją (TBD-page). Implementacja w iter 11 (listingi). Patrz docs/cta-registry.md.
 *
 * TODO iteracja 11: dropdown mega-menu po hover/klik na elementach
 * z `hasDropdown: true` (marki + szybki dostęp do popularnych modeli).
 */
export function SubNav() {
  return (
    <nav
      aria-label="Kategorie produktów"
      className="hidden border-b border-secondary-200 bg-white md:block"
    >
      <div className="container">
        <ul className="flex items-center gap-6 lg:gap-10">
          {NAV_CATEGORIES.map((cat) => (
            <li key={cat.href}>
              <Link
                href={cat.href}
                className="inline-flex items-center gap-1 py-3.5 text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600"
              >
                {cat.label}
                {cat.hasDropdown ? (
                  <ChevronDown className="h-4 w-4 text-secondary-500" aria-hidden="true" />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
