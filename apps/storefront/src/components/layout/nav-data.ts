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

/**
 * Grupy linków w stopce — Footer (3 kolumny linków + Kontakt który jest osobno
 * bo to dane kontaktowe, nie czyste linki).
 *
 * Większość href to placeholdery do iteracji 26 (strony statyczne MDX) lub V1
 * (konto klienta, zamówienia) — 404 do tego czasu.
 */
export type FooterLink = { label: string; href: string }
export type FooterLinkGroup = { title: string; links: readonly FooterLink[] }

export const FOOTER_LINK_GROUPS: readonly FooterLinkGroup[] = [
  {
    title: "Obsługa Klienta",
    links: [
      { label: "Moje konto", href: "/konto" },
      { label: "Zamówienia", href: "/konto/zamowienia" },
      { label: "Zwroty", href: "/zwroty" },
      { label: "Gwarancja i Reklamacje", href: "/gwarancja-i-reklamacje" },
    ],
  },
  {
    title: "O nas",
    links: [
      { label: "Informacje o firmie", href: "/o-firmie" },
      { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
      { label: "Regulamin", href: "/regulamin" },
    ],
  },
  {
    title: "Katalog",
    links: [
      { label: "Cały Asortyment", href: "/asortyment" },
      { label: "Haki Holownicze", href: "/haki" },
      { label: "Akcesoria", href: "/akcesoria" },
    ],
  },
] as const
