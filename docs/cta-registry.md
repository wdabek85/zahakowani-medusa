# CTA / Link Registry — gdzie i co podpiąć

Centralny rejestr wszystkich przycisków i linków w storefront, które prowadzą
do **wewnętrznych stron lub akcji**. Każdy wpis ma status:

- **DONE** — link działa, strona istnieje, nic nie robić
- **TBD-page** — link jest gotowy, ale strona docelowa jeszcze nie istnieje (kliknięcie = 404). Plan: zaimplementować w konkretnej iteracji.
- **TBD-target** — _decyzja biznesowa nie zapadła_ — gdzie ten link powinien faktycznie prowadzić? Wymaga input od usera.
- **TBD-action** — link na razie tylko nawiguje, ale docelowo ma uruchamiać akcję (np. add-to-cart, otwarcie modala, login flow).

**Konwencja w kodzie**: każdy link/CTA wymagający uwagi ma komentarz `// TODO(wiring): <opis>`
Grepowanie: `grep -rn "TODO(wiring)" apps/storefront/src/`

Linki `mailto:` / `tel:` / external (Google Fonts, admin Medusy) są **pominięte** — nie wymagają wiringu.

---

## Hero (strona główna)

| Lokalizacja | Tekst CTA | Obecny target | Status | Notatka |
|---|---|---|---|---|
| `components/hero/hero-section.tsx:35` | **Sprawdź ofertę** | `/szukaj` | **TBD-target** | User: "może powinno przenosić do podstrony sklepu z produktami albo do innej podstrony — potem ustalimy". Propozycje do wyboru: (a) `/szukaj` ogólny katalog, (b) `/sklep` lista wszystkich produktów, (c) `/kategorie/haki` najpopularniejsza kategoria, (d) `/oferta` strona promocyjna |
| `components/hero/vehicle-selector.tsx:131` | **SZUKAJ** (po wyborze auta) | `/szukaj?vehicle_id={generationId}` | TBD-page | Target intent jasny — listing wyników filtrowanych po `vehicle_id`. Strona `/szukaj` w iteracji 11 (brief #3 §11) |

---

## Header (`components/layout/header.tsx`)

| Lokalizacja | Tekst CTA | Obecny target | Status | Notatka |
|---|---|---|---|---|
| `header.tsx:46` | Logo (klik → home) | `/` | DONE | — |
| `header.tsx:54` | **Poradniki** (badge CTA z BookOpen) | `/poradniki` | TBD-page | Sekcja content marketing. Faza 5 (content + SEO) lub wcześniej jeśli user dostarczy artykuły |
| `header.tsx:87` | **Pomoc** (icon link) | `/kontakt` | TBD-page | Strona kontaktowa z formularzem + dane. Iter 12+ lub Faza 5 |
| `header.tsx:96` | Search icon | `/szukaj` | TBD-page | Listing/wyszukiwarka — iter 11 |
| `header.tsx:105` | User icon | `/konto` | TBD-page | Panel klienta. **Faza 6 V1** (B2C account) — login/register flow, historia zamówień, faktury |
| `header.tsx:114` | Cart icon + badge | `/koszyk` | TBD-page + TBD-action | Strona koszyka — iter 16+ (checkout). Badge counter wymaga `useCart` hook (jeszcze nieistniejący — z Medusa SDK przy podpinaniu cart) |

---

## SubNav — kategorie (`components/layout/sub-nav.tsx` + `nav-data.ts`)

| Lokalizacja | Tekst CTA | Obecny target | Status | Notatka |
|---|---|---|---|---|
| `sub-nav.tsx:25` (mapowane z `NAV_CATEGORIES`) | Haki holownicze, Bagażniki, Wiązki, itd. | `cat.href` z `nav-data.ts` | TBD-page | Strony kategorii (5 kategorii). Iter 11 (listingi) + iter 12 (filtry). Dropdowny SubNav obecnie placeholder — submenu w iter 11 |

---

## MobileMenu (`components/layout/mobile-menu.tsx`)

| Lokalizacja | Tekst CTA | Obecny target | Status | Notatka |
|---|---|---|---|---|
| `mobile-menu.tsx:82` | **Poradniki** | `/poradniki` | TBD-page | Patrz Header |
| `mobile-menu.tsx:93` | Kategorie (mapowane z `NAV_CATEGORIES`) | `cat.href` | TBD-page | Patrz SubNav |

---

## Footer (`components/layout/footer.tsx` + `nav-data.ts` `FOOTER_LINK_GROUPS`)

| Lokalizacja | Tekst CTA | Obecny target | Status | Notatka |
|---|---|---|---|---|
| `footer.tsx:39` | Logo footer | `/` | DONE | — |
| `footer.tsx:117` (mapowane z `FOOTER_LINK_GROUPS`) | 3 grupy linków: **Obsługa Klienta** / **O nas** / **Katalog** | `link.href` z `nav-data.ts` | TBD-page (różne) | Sprawdzić w `nav-data.ts` które konkretne linki potrzebują podstron (regulamin, polityka prywatności, FAQ, montaż, gwarancja, itp.). Większość = Faza 5 (content + SEO) |

---

## BrandsSection (`components/home/brands-section.tsx` + `FEATURED_BRANDS`)

| Lokalizacja | Tekst CTA | Obecny target | Status | Notatka |
|---|---|---|---|---|
| `brands-section.tsx` (mapowane z `FEATURED_BRANDS`) | 9 chipów marek (VW, Renault, Fiat, Mercedes, Ford, Peugeot, Nissan, Honda, BMW) | `/haki?marka={slug}` | TBD-page | Listing `/haki` z filtrem marki w query. Strona w iter 12 (listingi kategorii) |

---

## GuidesSection (`components/home/guides-section.tsx`)

| Lokalizacja | Tekst CTA | Obecny target | Status | Notatka |
|---|---|---|---|---|
| `guides-section.tsx` (4 karty `GUIDES`) | Karta poradnika "Poradniki" | `/poradniki/{slug}` | TBD-page | Poradniki z Sanity (Faza 5). Dane mockowe. Osobna sekcja od BlogSection (prostsze karty bez autora/daty) |

---

## BlogSection (`components/home/blog-section.tsx`)

| Lokalizacja | Tekst CTA | Obecny target | Status | Notatka |
|---|---|---|---|---|
| `blog-section.tsx` (3 karty `ARTICLES` + "Czytaj więcej") | Karta artykułu / "Czytaj więcej >" | `/poradniki/{slug}` | TBD-page | Strona artykułu z Sanity (Faza 5). Dane obecnie mockowe (placeholder copy o hakach). Link `/poradniki` z Headera/MobileMenu też tu celuje |

---

## ProductCard (`components/product/product-card.tsx`)

| Lokalizacja | Tekst CTA | Obecny target | Status | Notatka |
|---|---|---|---|---|
| `product-card.tsx:78` | Cała karta → PDP | `/produkt/{handle}` | TBD-page | Strona produktu — iter 13+ (PDP, brief #3 §13) |
| `product-card.tsx:140` (visual "Kup Teraz") | **Kup Teraz** (visual CTA wewnątrz Link) | (currently navigates with parent Link) | TBD-action | Docelowo: kliknięcie "Kup Teraz" → add-to-cart (`POST /store/carts/{id}/line-items`) zamiast nawigacji do PDP. Wymaga: (a) `useCart` hook, (b) Cart Provider, (c) zatrzymanie propagation z parent Link. Iter 7-full lub iter 16 |

---

## Decyzje czekające na input od usera

Lista skondensowana — TBD-target priorytet:

1. **HeroSection "Sprawdź ofertę"** → docelowa strona? (`/szukaj` vs `/sklep` vs konkretna kategoria vs strona promo)

(Dopisuj kolejne w trakcie rozwoju.)

---

## Workflow

Gdy podejmujesz decyzję dla danego CTA:

1. Zaktualizuj `href` w odpowiednim pliku
2. Usuń komentarz `// TODO(wiring): ...` z tej linii
3. Zmień status w tej tabeli na **DONE** (lub przenieś wpis do sekcji "Zrobione poniżej" — opcjonalne)

Gdy dodajesz nowy CTA wymagający uwagi:

1. Dorzuć komentarz `// TODO(wiring): <co i dlaczego>` nad linkiem w kodzie
2. Dopisz wiersz do odpowiedniej sekcji tabeli
