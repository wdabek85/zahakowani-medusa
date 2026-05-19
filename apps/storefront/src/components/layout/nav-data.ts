/**
 * Single source of truth dla linków kategorii w nawigacji.
 *
 * Używane przez `SubNav` (desktop pasek kategorii) i `MobileMenu` (drawer).
 *
 * `hasDropdown` = element ma mieć chevron i będzie miał dropdown menu —
 * mechanika dropdownów dorzucimy w iteracji 5 (VehicleSelectorNavbar)
 * lub 11 (finalna composition home page).
 *
 * `href` aktualnie wskazuje na strony listingu które jeszcze nie istnieją
 * (404 do iteracji 12-15) — to jest OK na MVP, placeholders.
 */
export type NavCategory = {
  label: string
  href: string
  hasDropdown: boolean
}

export const NAV_CATEGORIES: readonly NavCategory[] = [
  { label: "Haki Holownicze", href: "/haki", hasDropdown: true },
  { label: "Bagażniki Rowerowe", href: "/bagazniki", hasDropdown: true },
  { label: "Kompletne Zestawy Haki + Wiązki", href: "/zestawy", hasDropdown: true },
  { label: "Wiązki", href: "/wiazki-standalone", hasDropdown: true },
  { label: "Kontakt", href: "/kontakt", hasDropdown: false },
] as const
