/**
 * Stałe biznesowe Zahakowani — single source of truth dla danych kontaktowych,
 * adresu firmy i progów logistycznych (brief #3 §3).
 *
 * Używane przez: InfoBar, Header, Footer, /kontakt, /checkout, mail confirmation.
 *
 * V1 (Faza 6): część z tych wartości przenosimy do konfiguracji w admin
 * (FREE_SHIPPING_THRESHOLD_PLN, AUTHORIZED_DISTRIBUTORS itd.).
 */

export const SITE_NAME = "Zahakowani.pl"

// Kontakt
export const PHONE = "+48 536 731 515"
export const PHONE_HREF = "tel:+48536731515"

export const EMAIL = "kontakt@zahakowani.pl"
export const EMAIL_HREF = "mailto:kontakt@zahakowani.pl"

// Adres firmy
export const ADDRESS_STREET = "ul. Dworcowa 35"
export const ADDRESS_CITY = "83-240 Lubichowo"
/** Forma krótka — np. dla badge "Wysyłka z Lubichowa" */
export const LOCATION = "Lubichowo"

// Godziny pracy
export const BUSINESS_HOURS = "Pon – Pt: 6:00 – 18:00"

// Marketing
export const COMPANY_TAGLINE =
  "Oferujemy haki holownicze do wszystkich aut. Działamy na terenie Polski i za granicą, wspierając serwisy, warsztaty i klientów indywidualnych."

// Logistyka
// TODO V1: przenieść do konfiguracji w admin (Faza 5/6)
export const FREE_SHIPPING_THRESHOLD_PLN = 450

/**
 * Wyróżnione marki na stronie głównej (sekcja "Modele", Figma 414:1474).
 * Kolejność i lista wg projektu Figmy. `slug` trafia do `/haki?marka={slug}`.
 *
 * TODO V1: wybór automatyczny po liczbie produktów per marka (brief §6.5).
 */
export interface FeaturedBrand {
  label: string
  slug: string
}

export const FEATURED_BRANDS: readonly FeaturedBrand[] = [
  { label: "VW", slug: "volkswagen" },
  { label: "RENAULT", slug: "renault" },
  { label: "FIAT", slug: "fiat" },
  { label: "MERCEDES", slug: "mercedes" },
  { label: "FORD", slug: "ford" },
  { label: "PEUGEOT", slug: "peugeot" },
  { label: "NISSAN", slug: "nissan" },
  { label: "HONDA", slug: "honda" },
  { label: "BMW", slug: "bmw" },
] as const
