# Brief #3: Frontend Next.js — zahakowani MVP (v1.0)

Implementacja minimalistycznego sklepu sklepu B2C zahakowani. Pełna ścieżka zakupowa od strony głównej do "zamówienie złożone", bez integracji płatności/dostaw/faktur (te w Fazie 4).

**Kontekst wymagany dla CC:**
- `zahakowani-tech-stack-guidelines.md` v1.3 — stack, konwencje, jak budować + sekcja 26 (quirks Medusy 2.15.2)
- `zahakowani-raport-faza-1.md` — backend struktura
- `zahakowani-raport-faza-2.md` — admin UI + nowy quirk §26.11
- Ten dokument
- **Figma:** https://www.figma.com/design/bFOpp42bkgVtsOlzH3CSbb/Zahakowani---finall (fileKey: `bFOpp42bkgVtsOlzH3CSbb`)

**Workflow z Figmą:** masz plik Figma otwarty w desktopowej apce + zaznaczasz konkretną ramkę. CC używa MCP Figma `get_design_context` żeby pobrać kod + screenshot + tokeny dla tej ramki.

---

## 0. Cel i zakres

### Co wchodzi w Fazę 3

1. Strona główna (Hero + sekcje)
2. Listingi kategorii: `/haki`, `/bagazniki`, `/wiazki-standalone`
3. Strona wyników po pojeździe (cross-category)
4. Strona produktu z wariantami
5. Koszyk (drawer + `/koszyk`)
6. Checkout (single-page form, **bez realnej płatności**)
7. Strona "zamówienie złożone" (mock confirmation)
8. Strony statyczne: regulamin, polityka prywatności, dostawa, kontakt (MD/MDX w repo)
9. SEO: sitemap, robots, metadane, structured data
10. Layout: Header + Footer + Info pasek

### Co NIE wchodzi (Faza 4+)

- Realne płatności (Stripe / Przelewy24 / Tpay)
- Integracja kurierska (InPost / DPD / DHL)
- Faktury (Fakturownia / iFirma)
- Email transakcyjny
- Konto klienta + logowanie / rejestracja
- Wishlist, recently viewed, related products
- Blog/poradniki Sanity (placeholder "Wkrótce")
- Wyszukiwarka pełnotekstowa (V1)
- TrustedShops opinie (Faza 6)
- B2B portal (Faza 6)
- Aplikacja mobilna (nigdy)

### Kamień milowy

User przechodzi pełną ścieżkę: strona główna → wybór samochodu → listing → produkt → wariant → koszyk → checkout → "zamówienie złożone". Bez realnej płatności (mock confirmation), ale wszystko inne działa, SEO poprawne, Core Web Vitals zielone.

---

## 1. Stack i konwencje

### Stack (z guidelines §16)

- **Next.js 15** App Router
- **React 19**
- **TypeScript strict**
- **Tailwind CSS** + tokeny z Figmy
- **shadcn/ui** — kopiowane komponenty (Dialog, Drawer, Combobox, Toast, Tooltip, Dropdown, Accordion, Tabs, Sheet)
- **lucide-react** — ikony (kompatybilne API z Heroicons z Figmy, lepsze tree-shaking)
- **Framer Motion** — animacje skomplikowane (CartDrawer, transitions)
- **TanStack Query** — fetch w Client Components
- **React Hook Form + Zod** — formularze + walidacja
- **next/image, next/font** — performance

### Konwencje (z guidelines §3, 4, 5)

- Pliki `kebab-case.ts`
- Komponenty `PascalCase`
- TypeScript strict, zero `any`
- Server Components domyślnie, `'use client'` tylko gdzie konieczne
- Komentarze po angielsku, commit messages po polsku z prefiksem `[FAZA-3]`
- Atomic Design: atomy → molekuły → organizmy → templates

### Konwencja reużywalności (KRYTYCZNE dla CC)

**Przed dodaniem nowego komponentu CC MUSI:**
1. Sprawdzić `components/ui/` — czy istnieje podobny atom
2. Sprawdzić `components/{module}/` — czy istnieje podobny organizm
3. Jeśli istnieje: użyć / rozszerzyć przez props (variant, size)
4. Jeśli nie istnieje: stworzyć w odpowiedniej warstwie
5. W commit message zaznaczyć: `dodano nowy komponent X w warstwie Y` lub `rozszerzono komponent X o variant Y`

**Zasady:**
- Zero `<RedButton>` / `<BlueButton>` — jeden `<Button variant="primary|secondary" size="md|xl" />`
- Zero CSS inline
- Zero magic numbers (kolory, spacing → z `tailwind.config.ts`)
- Zero kopiowania JSX między stronami (jeśli ten sam JSX 2× → wynieś)

---

## 2. Struktura projektu

```
apps/storefront/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (shop)/                   # group route — sklepowe strony
│   │   │   ├── page.tsx              # strona główna
│   │   │   ├── haki/
│   │   │   │   └── page.tsx          # listing haków
│   │   │   ├── haki/[brand]/[model]/[generation]/
│   │   │   │   └── page.tsx          # SEO landing: /haki/skoda/octavia/3
│   │   │   ├── bagazniki/
│   │   │   │   └── page.tsx
│   │   │   ├── wiazki-standalone/
│   │   │   │   └── page.tsx
│   │   │   ├── szukaj/
│   │   │   │   └── page.tsx          # wyniki cross-category po pojeździe
│   │   │   ├── produkt/[handle]/
│   │   │   │   └── page.tsx
│   │   │   ├── koszyk/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx
│   │   │   ├── zamowienie-zlozone/
│   │   │   │   └── page.tsx
│   │   │   ├── regulamin/page.tsx
│   │   │   ├── polityka-prywatnosci/page.tsx
│   │   │   ├── dostawa/page.tsx
│   │   │   └── kontakt/page.tsx
│   │   ├── layout.tsx                # root layout
│   │   ├── providers.tsx             # QueryClientProvider, etc.
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # ATOMY (shadcn copy-paste)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── spinner.tsx
│   │   │   └── container.tsx
│   │   │
│   │   ├── form/                     # MOLEKUŁY
│   │   │   ├── form-field.tsx        # Input + Label + Error
│   │   │   ├── search-bar.tsx
│   │   │   └── breadcrumbs.tsx
│   │   │
│   │   ├── vehicle/                  # ORGANIZMY: pojazd
│   │   │   ├── vehicle-selector-hero.tsx     # duży na home
│   │   │   ├── vehicle-selector-navbar.tsx   # mały w nagłówku
│   │   │   └── vehicle-tag.tsx               # tag wybranego auta
│   │   │
│   │   ├── product/                  # ORGANIZMY: produkty
│   │   │   ├── product-card.tsx              # karta na listingu (Figma v2)
│   │   │   ├── product-gallery.tsx           # galeria na stronie produktu
│   │   │   ├── product-spec-table.tsx        # tabela parametrów
│   │   │   ├── product-spec-icons.tsx        # ikonki parametrów (uciąg/nacisk/etc)
│   │   │   ├── variant-selector.tsx          # radio 5 wariantów haka
│   │   │   ├── price-tag.tsx                 # cena z VAT info
│   │   │   ├── variant-badge.tsx             # badge "Sam hak", "Z modułem 13-Pin"
│   │   │   ├── authorized-badge.tsx          # "Autoryzowany dystrybutor"
│   │   │   ├── warranty-badge.tsx            # "Gwarancja 2 lata"
│   │   │   ├── rating-stars.tsx              # gwiazdki (placeholder 0,0)
│   │   │   ├── fitment-list.tsx              # lista pasujących pojazdów
│   │   │   └── add-to-cart-button.tsx
│   │   │
│   │   ├── category/                 # ORGANIZMY: listing
│   │   │   ├── category-filters.tsx          # sidebar filtrów
│   │   │   ├── filter-section.tsx
│   │   │   ├── filter-range.tsx              # zakres (min-max)
│   │   │   └── filter-checkbox.tsx
│   │   │
│   │   ├── cart/                     # ORGANIZMY: koszyk
│   │   │   ├── cart-drawer.tsx               # side drawer
│   │   │   ├── cart-item.tsx
│   │   │   ├── cart-summary.tsx
│   │   │   └── empty-cart.tsx
│   │   │
│   │   ├── checkout/                 # ORGANIZMY: checkout
│   │   │   ├── checkout-form.tsx
│   │   │   ├── checkout-section.tsx
│   │   │   ├── shipping-options.tsx          # mock w MVP
│   │   │   └── payment-options.tsx           # mock w MVP
│   │   │
│   │   ├── home/                     # ORGANIZMY: strona główna
│   │   │   ├── hero-section.tsx
│   │   │   ├── popular-products-section.tsx  # "Najczęściej Przeglądane"
│   │   │   ├── brands-section.tsx            # "Sekcja Modele"
│   │   │   ├── guides-section.tsx            # "Poradniki" (placeholder)
│   │   │   └── why-us-section.tsx            # "Dlaczego my"
│   │   │
│   │   └── layout/                   # TEMPLATE'Y
│   │       ├── header.tsx                    # logo + nav + VehicleSelector navbar + ikona koszyka
│   │       ├── footer.tsx
│   │       ├── info-bar.tsx                  # pasek info na górze
│   │       └── page-wrapper.tsx
│   │
│   ├── lib/
│   │   ├── medusa/                   # Medusa SDK config + queries
│   │   │   ├── client.ts
│   │   │   ├── products.ts           # fetchProducts, fetchProduct
│   │   │   ├── vehicle.ts            # fetchVehicleLookup, fetchByVehicle
│   │   │   ├── categories.ts
│   │   │   └── cart.ts               # createCart, addItem, updateItem, removeItem
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                 # className merging (shadcn standard)
│   │   │   ├── variant-wiring.ts     # getVariantWiringInfo (workaround §26.1)
│   │   │   ├── price.ts              # formatPrice, formatVAT
│   │   │   ├── url.ts                # buildProductUrl, buildCategoryUrl
│   │   │   └── constants.ts          # FREE_SHIPPING_THRESHOLD_PLN, PHONE, LOCATION
│   │   │
│   │   ├── seo/
│   │   │   ├── metadata.ts           # generateMetadata helpers
│   │   │   ├── structured-data.ts    # JSON-LD generators
│   │   │   └── sitemap.ts            # sitemap helpers
│   │   │
│   │   └── auth/                     # placeholder w MVP (guest only)
│   │       └── guest.ts
│   │
│   ├── hooks/                        # custom React hooks
│   │   ├── use-cart.ts
│   │   ├── use-vehicle-selection.ts  # persistuj wybrany pojazd (localStorage NIE — patrz §15)
│   │   └── use-debounce.ts
│   │
│   ├── types/                        # współdzielone typy (lub przez packages/types)
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   └── vehicle.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── content/                      # statyczne MD/MDX
│       ├── regulamin.mdx
│       ├── polityka-prywatnosci.mdx
│       ├── dostawa.mdx
│       └── kontakt.mdx
│
├── public/
│   ├── images/
│   ├── logo.svg
│   └── favicon.ico
│
├── tailwind.config.ts                # tokeny z Figmy
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 3. Tokeny designu (eksport z Figmy do Tailwind)

### Stałe biznesowe (`src/lib/utils/constants.ts`)

```ts
export const PHONE = "+48 536 731 515";
export const PHONE_DISPLAY = "+48 536 731 515";
export const PHONE_HREF = "tel:+48536731515";
export const LOCATION = "Lubichowo";
export const LOCATION_PICKUP_HOURS = "do 18:00";
export const COMPANY_NAME = "zahakowani";

// TODO: refactor do admin config w V1
export const FREE_SHIPPING_THRESHOLD_PLN = 450;

// TODO: refactor do admin config w V1
export const NEXT_DAY_DELIVERY_CUTOFF = "14:00";

// TODO: refactor do tabeli Manufacturer w V1 z is_authorized_distributor
export const AUTHORIZED_DISTRIBUTORS = [
  "Imioła Hak-Pol",
  // dodawać manualnie kolejne marki
];

// TODO: refactor do realnych statystyk popularności w V1
export const FEATURED_BRANDS = [
  { code: "skoda", name: "Skoda" },
  { code: "vw", name: "Volkswagen" },
  { code: "ford", name: "Ford" },
  { code: "toyota", name: "Toyota" },
  { code: "bmw", name: "BMW" },
  { code: "audi", name: "Audi" },
  { code: "renault", name: "Renault" },
  { code: "opel", name: "Opel" },
];

// TODO: refactor do realnego trackingu w V1
export const POPULAR_PRODUCTS_LIMIT = 8;
```

### Tokeny Tailwind (`tailwind.config.ts`)

**Workflow:** CC z otwartą Figmą pobiera design tokens przez MCP `get_variable_defs` (gdy user ma plik aktywny). W pierwszej iteracji **CC pyta usera** o screenshoty z sekcji Figmy z definicjami kolorów/typografii lub o eksport tokenów.

Przewidywana struktura:

```ts
// tailwind.config.ts
export default {
  content: [...],
  theme: {
    extend: {
      colors: {
        primary: { /* niebieski z Figmy — paleta 50-900 */ },
        secondary: { /* szary z Figmy */ },
        accent: { /* akcent z Figmy */ },
        success: { /* green */ },
        error: { /* red */ },
        warning: { /* yellow */ },
      },
      fontFamily: {
        sans: ['<font z Figmy>', 'system-ui', 'sans-serif'],
      },
      fontSize: { /* skala typograficzna z Figmy */ },
      spacing: { /* spacing scale z Figmy */ },
      borderRadius: { /* corner radius z Figmy */ },
      boxShadow: { /* shadows z Figmy */ },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px', // desktop max z Figmy
      },
    },
  },
};
```

---

## 4. Backend integration

### Endpointy Store API (z Fazy 1)

| Endpoint | Co zwraca | Użycie |
|---|---|---|
| `GET /store/products?limit=20&offset=0` | Listing produktów z filtrami | Listing kategorii |
| `GET /store/products/:handle` | Szczegóły produktu z wariantami | Strona produktu |
| `GET /store/products/by-vehicle/:generationId` | Cross-category produkty pasujące do pojazdu | Wyniki wyszukiwania po pojeździe |
| `GET /store/vehicle-fitment/lookup` | Flat tree Brand→Model→Generation | VehicleSelector |
| `GET /store/categories` | Lista kategorii (haki / bagażniki / wiązki) | Nawigacja, footer |
| `GET /store/landing/:brand-:model-:generation` | SEO landing page data | `/haki/skoda/octavia/3` |

### Medusa SDK / fetch helpers

W `lib/medusa/`:
- W Server Components: zwykły `fetch` z absolute URL (`process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL`)
- W Client Components: TanStack Query z tym samym fetchem
- Cache strategie per typ strony (patrz §5)

### Variant Wiring helper (§26.1 workaround)

Helper `src/lib/utils/variant-wiring.ts`:

```ts
type VariantWiringInfo = {
  equipmentId: string | null;
  equipmentCode: string | null;
  label: string;  // "Sam hak" | "Z wiązką 7-Pin" | "Z modułem 13-Pin"
  shortLabel: string;  // "Sam hak" | "Wiązka 7-Pin" | "Moduł 13-Pin"
};

export function getVariantWiringInfo(variant: ProductVariant): VariantWiringInfo {
  const equipmentCode = variant.metadata?.wiring_equipment_code as string | undefined;
  const equipmentId = variant.metadata?.wiring_equipment_id as string | undefined;
  
  switch (equipmentCode) {
    case "BARE": return { equipmentId, equipmentCode, label: "Sam hak", shortLabel: "Sam hak" };
    case "W7":   return { equipmentId, equipmentCode, label: "Z wiązką 7-Pin", shortLabel: "Wiązka 7-Pin" };
    case "W13":  return { equipmentId, equipmentCode, label: "Z wiązką 13-Pin", shortLabel: "Wiązka 13-Pin" };
    case "M7":   return { equipmentId, equipmentCode, label: "Z modułem 7-Pin", shortLabel: "Moduł 7-Pin" };
    case "M13":  return { equipmentId, equipmentCode, label: "Z modułem 13-Pin", shortLabel: "Moduł 13-Pin" };
    default:     return { equipmentId: null, equipmentCode: null, label: "", shortLabel: "" };
  }
}
```

Wykorzystywany w:
- `VariantSelector` (radio 5 wariantów haka)
- `VariantBadge` (badge na karcie produktu)
- `CartItem` (informacja jaki wariant w koszyku)
- Wszędzie gdzie pokazujemy wariant haka

---

## 5. Rendering strategy

| Strona | Strategia | revalidate | Cache |
|---|---|---|---|
| `/` strona główna | **ISR** | 1h | static |
| `/haki`, `/bagazniki`, `/wiazki-standalone` listingi | **ISR** | 5 min | static |
| `/haki/[brand]/[model]/[generation]` landing SEO | **ISR** | 5 min | static |
| `/produkt/[handle]` | **ISR** | 5 min | static |
| `/szukaj?vehicle=...` | **SSR** (search params) | — | no-store |
| `/koszyk` | **CSR** | — | user-specific |
| `/checkout` | **CSR** | — | user-specific |
| `/zamowienie-zlozone` | **CSR** | — | user-specific |
| `/regulamin`, `/polityka`, `/dostawa`, `/kontakt` | **SSG** | — | static |

### Server vs Client Components

**Server Components (większość):**
- Strona główna (wszystkie sekcje statyczne)
- Listingi (Server Component pobiera dane, Client Component renderuje filtry)
- Strona produktu (galeria, parametry, opis)
- Strony statyczne

**Client Components (gdy interakcja):**
- `VehicleSelectorHero`, `VehicleSelectorNavbar`
- `VariantSelector`
- `AddToCartButton`
- `CartDrawer`, `CartItem`
- `CheckoutForm` i wszystkie pod-formy
- `CategoryFilters` (interaktywne filtry)
- Cokolwiek z `useState`, `useEffect`, eventami

---

## 6. STRONA: Strona główna `/`

### 6.1. Sekcja Info Bar (na samej górze)

**Layout:** wąski pasek na całą szerokość, ciemne tło.

**Content:** 3 elementy w jednej linii (desktop) / poziomy scroll (mobile):
- 🕐 "Kup do 14:00, dostawa następnego dnia"
- 📍 "Odbierz w Lubichowie do 18:00"
- 📞 "+48 536 731 515 — zamów telefonicznie"

**Komponent:** `components/layout/info-bar.tsx` (Server Component)

### 6.2. Header

**Desktop layout:** logo | nawigacja (Haki / Bagażniki / Wiązki / Poradniki) | VehicleSelectorNavbar (mały) | ikona koszyka z licznikiem | ikona search.

**Mobile layout:** hamburger | logo | ikona koszyka.

**Komponent:** `components/layout/header.tsx`

**VehicleSelectorNavbar:** kompaktowy dropdown pokazujący wybrane auto ("Skoda Octavia 3 ▼") z możliwością zmiany. Jeśli brak wybranego — pokazuje CTA "Wybierz samochód".

### 6.3. Hero z VehicleSelector

**Layout (desktop):** pełnoekranowy hero (~600px wysokości), tło/grafika z prawej, treść z lewej.

**Treść:**
- H1: "Twój hak holowniczy. Pasujący do Twojego auta."
- Sub: "Sprawdź jakie produkty pasują do Twojego samochodu — zacznij od wpisania modelu"
- **VehicleSelectorHero** (kaskadowy: Marka → Model → Generacja) — duża wersja z Figmy
- Po wybraniu generacji: CTA "Pokaż pasujące produkty" → redirect na `/szukaj?vehicle={generationId}`

**Komponent:** `components/home/hero-section.tsx` (Server) + `components/vehicle/vehicle-selector-hero.tsx` (Client)

### 6.4. Sekcja "Najczęściej Przeglądane i Kupowane"

**Source danych:** mock w MVP — `GET /store/products?limit=8&order=created_at:desc` (ostatnie 8 dodanych).

**TODO v1:** zastąpić realnym trackingiem popularności.

**Layout:** grid 4 kolumny (desktop) / 2 kolumny (mobile), `ProductCard` per produkt.

**Komponent:** `components/home/popular-products-section.tsx` (Server Component, fetch on render)

### 6.5. Sekcja Modele

**Source danych:** hardcoded `FEATURED_BRANDS` z constants.

**TODO v1:** wybór automatyczny na podstawie liczby produktów per marka.

**Layout:** grid 8 marek (desktop) / 4 (mobile). Każda marka = card z logo + nazwa, klik → `/haki?marka={code}` (filtr w URL).

**Komponent:** `components/home/brands-section.tsx`

**Loga marek:** w MVP placeholder (SVG generyczny lub pierwsze litery). Realne loga w V1.

### 6.6. Sekcja Poradniki (placeholder)

**Source:** brak (Sanity w Fazie 5).

**Layout:** sekcja z napisem "Poradniki — wkrótce" + 4 mockowane karty z grayscale obrazkami.

**Komponent:** `components/home/guides-section.tsx`

**TODO Faza 5:** integracja z Sanity, real content.

### 6.7. Sekcja "Dlaczego my" (Why Us)

**Layout:** 3-4 karty z ikonkami i tekstem:
- 🛡️ "Autoryzowany dystrybutor"
- ✅ "Gwarancja 2 lata"
- 📞 "Doradztwo telefoniczne"
- 🚚 "Darmowa dostawa od 450 zł"

**Komponent:** `components/home/why-us-section.tsx`

### 6.8. Footer

**Sekcje:**
- Kontakt (telefon, lokalizacja, email)
- Linki: Regulamin, Polityka prywatności, Dostawa, Kontakt
- Linki: Haki, Bagażniki, Wiązki, Poradniki
- Stopka: copyright, NIP (do uzupełnienia), payment badges (mock — placeholder w MVP)

**Komponent:** `components/layout/footer.tsx`

---

## 7. STRONA: Listingi kategorii `/haki`, `/bagazniki`, `/wiazki-standalone`

### 7.1. Layout

**Desktop:** sidebar filtrów (240px) po lewej + grid produktów (4 kolumny) po prawej.
**Mobile:** filtry w drawerze (przycisk "Filtry" otwiera Sheet), grid 2 kolumny.

### 7.2. Breadcrumbs

Strona główna > Haki

Jeśli wybrany pojazd: Strona główna > Haki > Skoda Octavia 3

### 7.3. Filtry sidebar

**Filtry per kategoria:**

**`/haki`:**
- Marka pojazdu (multi-select checkbox)
- Model pojazdu (kaskadowy do marki)
- Generacja (kaskadowy do modelu)
- Producent (manufacturer) — multi-select
- Homologacja — multi-select
- Uciąg (zakres min-max)
- Nacisk na kulę (zakres min-max)
- Cena (zakres min-max)
- Cięcie zderzaka (tak/nie/wszystkie)

**`/bagazniki`:**
- Producent
- Max rowerów (multi-select: 2, 3, 4)
- Max ładowność (zakres)
- Składany (switch)
- Z światłami (switch)
- Cena (zakres)

**`/wiazki-standalone`:**
- Producent
- Typ (Wiązka / Moduł)
- Pin count (7 / 13)
- Uniwersalny (switch)
- Cena (zakres)

**Komponent:** `components/category/category-filters.tsx` (Client)

**Implementacja:**
- Stan filtrów w URL params (Next.js `useSearchParams`)
- Filtrowanie zakresów JS-side (quirk §26.8) — fetch full list, filter w komponencie
- Debounce 300ms na inputach zakresowych

### 7.4. ProductCard (Figma v2 — z parametrami graficznie)

**Layout (desktop):**
```
[ Miniaturka 250×250 ]    [ Tagi: variant labels ]
                          [ Producent + Autoryzowany badge ]
                          [ Tytuł produktu ]
                          [ Ikonki parametrów: uciąg | nacisk | homologacja | cięcie ]
                          [ Gwarancja 2 lata ]
                          [ Ocena: 0,0 / 0 Opinii ]

                          [ Cena: 428,56 zł/szt. + VAT info ]
                          [ Darmowa dostawa od 450zł ]
                          [ Info: dostawa do 14, odbiór Lubichowo ]
                          [ Button: Zobacz produkt ]
                          [ Zamów telefonicznie +48 536 731 515 ]
```

**Variant labels (Figma "Tagi Oferty"):**
- Generowane z `variant.metadata.wiring_equipment_code` per wariant produktu
- Pokazane jako badge `Label` (z Figmy)
- Max 2-3 widoczne, reszta jako "+N więcej"

Dla haka z 5 wariantami: pokazujemy 2 main: "Sam hak", "Moduł 13-Pin" + "+3 warianty".
Dla bagażnika i wiązki uniwersalnej: brak tagów wariantów (single-variant).
Dla wiązki dedykowanej: tag "Wiązka 7-Pin" lub "Moduł 13-Pin" (jeden).

**Authorized Badge:**
Pokazuje się jeśli `manufacturer` jest w `AUTHORIZED_DISTRIBUTORS`. Treść: "Jesteśmy autoryzowanym dystrybutorem marki {manufacturer}".

**Cena:**
- Format: "428,56 zł/szt." (przecinek dziesiętny)
- Dla produktu z wariantami: pokazujemy "od X zł" (najtańszy wariant)
- Pod ceną: "Cena zawiera 23% VAT, nie obejmuje kosztów dostawy"
- Niżej: "Darmowa dostawa od 450zł"

**Komponent:** `components/product/product-card.tsx` (Server Component — bez interakcji, ale klik prowadzi do `/produkt/[handle]`)

### 7.5. Sortowanie i paginacja

**Sortowanie:** dropdown nad gridem:
- Najnowsze (default)
- Cena rosnąco
- Cena malejąco
- Nazwa A-Z

**Paginacja:** 20 produktów per strona, klasyczna paginacja na dole (1 2 3 ... 5).

### 7.6. Brak wyników

Jeśli filtry zwrócą 0 wyników: ekran z ilustracją + tekst "Brak produktów. Spróbuj zmienić filtry." + CTA "Wyczyść filtry".

---

## 8. STRONA: Wyniki wyszukiwania po pojeździe `/szukaj`

### 8.1. Query params

`/szukaj?vehicle={generationId}` — cross-category search po pojeździe.

### 8.2. Layout

**Header strony:**
- Breadcrumb: Strona główna > Wyniki dla: Skoda Octavia 3 (2013-2019)
- H1: "Produkty pasujące do Skoda Octavia 3"
- Zmień pojazd: button "← Zmień samochód" otwierający `VehicleSelectorHero` jako modal

**Sekcje wyników (per kategoria):**
1. **Haki** (jeśli pasujące istnieją) — grid 4 kolumny + link "Zobacz wszystkie pasujące haki →"
2. **Bagażniki rowerowe** (uniwersalne, zawsze pasują) — grid
3. **Wiązki standalone** (uniwersalne + dedykowane do generacji) — grid

Każda sekcja ma max 8 produktów + CTA do pełnego listingu.

**Endpoint:** `GET /store/products/by-vehicle/:generationId`

**Komponent:** `app/(shop)/szukaj/page.tsx` (Server Component, fetch on render z searchParams)

---

## 9. STRONA: Strona produktu `/produkt/[handle]`

### 9.1. Layout (desktop)

```
[ Breadcrumbs: Strona główna > Haki > Skoda Octavia 3 > Hak Z/016 ]

[ Galeria 50% szer. ]   [ Tagi: variant labels ]
                        [ Producent + Authorized badge ]
                        [ H1: Tytuł produktu ]
                        [ Ocena: 0,0 / 0 Opinii ]
                        
                        [ ProductSpecIcons (graficznie) ]
                        
                        [ VariantSelector (5 wariantów haka / 1 dla pozostałych) ]
                        
                        [ Cena dynamiczna (zmiania z wariantu) ]
                        [ VAT info ]
                        [ Darmowa dostawa od 450 zł ]
                        [ Info: dostawa do 14, odbiór Lubichowo ]
                        
                        [ AddToCartButton ]
                        [ Zamów telefonicznie ]
                        
                        [ Gwarancja 2 lata badge ]
```

Pod fold:
```
[ Tabs: Opis | Parametry | Pasujące pojazdy | Dokumenty ]
```

### 9.2. ProductGallery

**Komponent:** `components/product/product-gallery.tsx` (Client — lightbox)

- Główne zdjęcie + 4-6 miniatur pod
- Klik na miniaturę zmienia główne zdjęcie
- Klik na główne zdjęcie otwiera lightbox (Dialog full-screen)
- W lightboxie: strzałki, zamknij ESC
- `next/image` z `priority` dla głównego zdjęcia

### 9.3. VariantSelector (5 wariantów haka)

**Komponent:** `components/product/variant-selector.tsx` (Client)

**Layout:** 5 radio buttonów z opisem:
```
○ Sam hak                — 850,00 zł
● Z wiązką 7-Pin         — 1100,00 zł
○ Z wiązką 13-Pin        — 1200,00 zł
○ Z modułem 7-Pin        — 1450,00 zł
○ Z modułem 13-Pin       — 1550,00 zł
```

**Labels:** z `getVariantWiringInfo(variant).label`.

**Domyślnie zaznaczony:** najtańszy wariant (BARE).

**Zmiana wariantu:** aktualizuje cenę, AddToCartButton wie który variantId dodać.

**Dla single-variant produktów (bagażnik, wiązka uniwersalna):** komponent NIE renderuje się.

### 9.4. ProductSpecIcons (parametry graficznie)

**Komponent:** `components/product/product-spec-icons.tsx`

**Per kategoria:**

**Hak:**
- 🡢 Uciąg (np. 1600kg)
- 🡣 Nacisk (np. 80kg)
- 📋 Homologacja (np. E20)
- ✂️ Cięcie zderzaka (Tak/Nie)

**Bagażnik:**
- 🚲 Max rowerów (np. 3)
- ⚖️ Ładowność (np. 60kg)
- ⚡ Gniazdo (7-Pin / 13-Pin)
- 🔒 Zamykany (Tak/Nie)

**Wiązka standalone:**
- 🔌 Pin count (7 / 13)
- 🚦 Stop lights (Tak)
- 💡 Indicators (Tak)
- 🌫️ Fog lights (Tak/Nie)

**Layout:** poziomy rząd ikonek z wartościami pod spodem, na desktop max 4 widoczne.

### 9.5. Pełne parametry (Tab "Parametry")

`ProductSpecTable` — pełna tabela parametrów dla zaawansowanych. Format z Figmy (frame 69:2643):

| Parametr | Wartość |
|---|---|
| Uciąg | 1600 kg |
| Nacisk na kulę haka | 80 kg |
| Montaż bez cięcia zderzaka | Tak |
| Moduł 13-Pin w zestawie | Zależy od wariantu |
| Homologacja haka | E20 |
| Kula haka | odkręcana |
| Gwarancja | 2 lata od zakupu |
| Waga | 12 kg |

### 9.6. Pasujące pojazdy (Tab)

`FitmentList` — lista pasujących pojazdów do tego produktu (z linków `Product ↔ Generation`).

Layout: lista typu "Skoda Octavia 3 (2013-2019)", grouped by Brand.

Dla produktów uniwersalnych: badge "Pasuje do wszystkich aut".

### 9.7. Dokumenty (Tab)

Linki do plików:
- 📄 Instrukcja montażu (PDF)
- 📋 Certyfikat homologacji (PDF)

Jeśli pliki nie są ustawione (`installation_manual_url` / `certificate_url` null): tab nie renderuje się.

### 9.8. AddToCartButton

**Komponent:** `components/product/add-to-cart-button.tsx` (Client)

**Behavior:**
- Klik → wywołuje `addToCart(variantId, qty=1)`
- Loading state (spinner) w trakcie
- Sukces → otwiera `CartDrawer` z animacją + toast "Dodano do koszyka"
- Błąd → toast error

**Cart logic:** Medusa SDK / Store API standardowe (`POST /store/carts/:id/line-items`).

---

## 10. KOSZYK: Drawer + strona `/koszyk`

### 10.1. CartDrawer (slide z prawej)

**Komponent:** `components/cart/cart-drawer.tsx` (Client, Sheet z shadcn)

**Trigger:** klik na ikonę koszyka w nagłówku LUB automatycznie po dodaniu produktu (z 3-sekundowym auto-close jeśli user nie kliknie nic).

**Layout:**
- Header drawera: "Twój koszyk (3 produkty)" + X
- Lista CartItem (scroll jeśli dużo)
- Footer: suma + button "Przejdź do koszyka" (→ `/koszyk`) + button "Do kasy" (→ `/checkout`)

**CartItem:**
```
[ Miniaturka 80×80 ]  Tytuł produktu                    [ X ]
                      Wariant: Z modułem 13-Pin
                      [- 1 +]                  1 550,00 zł
```

**Animacja:** Framer Motion — slide-in z prawej z easing, opacity backdrop.

### 10.2. Strona `/koszyk` (full view)

**Layout:**
- Header: H1 "Twój koszyk"
- Tabela CartItems (większa, więcej info)
- Sidebar po prawej: podsumowanie (suma, "Darmowa dostawa od 450 zł", button "Do kasy")

**Empty state:** ikonka + "Twój koszyk jest pusty" + CTA "Wróć do zakupów" (→ home).

**Komponent:** `app/(shop)/koszyk/page.tsx` (Client — wymaga stanu koszyka)

---

## 11. CHECKOUT: `/checkout`

### 11.1. Layout

**Single-page z sekcjami pod sobą** (zgodnie z decyzją usera):

```
[ Breadcrumb: Koszyk > Dane > Dostawa > Płatność ]

[ Sekcja 1: Dane kontaktowe ]
  - Email (RHF + Zod)
  - Telefon
  - [ Checkbox: zarejestruj mnie ] — DISABLED w MVP (guest only)

[ Sekcja 2: Adres dostawy ]
  - Imię i nazwisko
  - Ulica
  - Kod pocztowy
  - Miasto
  - Kraj (Polska, disabled)

[ Sekcja 3: Sposób dostawy ]
  - Radio:
    ○ InPost Paczkomat — wybierz paczkomat (mock)        — 14,99 zł
    ○ InPost Kurier                                       — 19,99 zł
    [ Darmowa dostawa od 450 zł — komunikat jeśli zamówienie > 450 ]

[ Sekcja 4: Faktura ]
  - [ Checkbox: chcę fakturę ]
  - (jeśli zaznaczone) NIP, nazwa firmy, adres

[ Sekcja 5: Płatność (MOCK w MVP) ]
  - Radio:
    ○ Przelewy24 (BLIK, transfer, karta)
    ○ Płatność przy odbiorze (+5 zł)
  - [ Info: "To MVP — płatność nie zostanie zrealizowana" ]

[ Sekcja 6: Podsumowanie ]
  - Lista produktów (compact)
  - Suma: produkty + dostawa = razem
  - [ Checkbox: akceptuję regulamin ]
  - [ Button: Zamów i zapłać (MOCK) ]
```

**Komponent:** `components/checkout/checkout-form.tsx` (Client, React Hook Form + Zod)

### 11.2. Walidacja Zod

`src/lib/checkout/schema.ts`:

```ts
export const checkoutSchema = z.object({
  email: z.string().email("Niepoprawny email"),
  phone: z.string().regex(/^\+?[0-9\s\-]+$/, "Niepoprawny telefon").min(9),
  
  firstName: z.string().min(2, "Min 2 znaki"),
  lastName: z.string().min(2, "Min 2 znaki"),
  street: z.string().min(3),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Format 00-000"),
  city: z.string().min(2),
  
  shippingMethod: z.enum(["inpost_paczkomat", "inpost_kurier"]),
  paczkomatCode: z.string().optional(), // wymagane jeśli shippingMethod=inpost_paczkomat
  
  wantInvoice: z.boolean(),
  invoiceData: z.object({
    nip: z.string().regex(/^\d{10}$/, "Niepoprawny NIP").optional(),
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
  }).optional(),
  
  paymentMethod: z.enum(["przelewy24", "cod"]),
  
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Wymagane" }) }),
}).superRefine((data, ctx) => {
  if (data.shippingMethod === "inpost_paczkomat" && !data.paczkomatCode) {
    ctx.addIssue({ path: ["paczkomatCode"], code: "custom", message: "Wybierz paczkomat" });
  }
  if (data.wantInvoice && !data.invoiceData?.nip) {
    ctx.addIssue({ path: ["invoiceData", "nip"], code: "custom", message: "Wymagany NIP" });
  }
});
```

### 11.3. Submit (MOCK w MVP)

Po submit:
1. Zapis order w Medusie przez Store API (status: `pending`)
2. Brak realnej płatności (Stripe / Przelewy24)
3. Redirect na `/zamowienie-zlozone?orderId={id}`

**TODO Faza 4:** integracja płatności i kurierów.

---

## 12. STRONA: `/zamowienie-zlozone`

### 12.1. Layout

```
[ ✓ ikona success ]

H1: Dziękujemy za zamówienie!

Numer zamówienia: #ZAH-2026-00123
Status: Oczekuje na płatność (MOCK w MVP)

[ Podsumowanie zamówienia: lista produktów + suma ]

[ Info: "Na adres {email} wysłaliśmy potwierdzenie zamówienia (MOCK — w MVP nie wysyła)" ]

[ Co dalej: "Skontaktujemy się z Tobą telefonicznie aby potwierdzić zamówienie." ]

[ CTA: Wróć na stronę główną ]
```

**Komponent:** `app/(shop)/zamowienie-zlozone/page.tsx` (Client, czyta orderId z searchParams).

---

## 13. STRONY STATYCZNE

### 13.1. `/regulamin`, `/polityka-prywatnosci`, `/dostawa`, `/kontakt`

**Source:** MDX w `src/content/`.

**Layout:** prosta strona prose z headerem, treścią z MDX, footerem.

**Treść:** w MVP **placeholder** ("Treść w przygotowaniu") z możliwością łatwej edycji w pliku MDX. Realne treści przed launchem (Faza 5).

**Komponent:** każda strona to osobny `page.tsx` importujący MDX.

### 13.2. `/kontakt`

Wyjątek: nie tylko placeholder, ale konkretna treść:
- Adres: Lubichowo
- Telefon: +48 536 731 515
- Email: kontakt@zahakowani.pl (do ustalenia przed launch)
- Godziny: poniedziałek-piątek 8:00-18:00 (do ustalenia)
- Formularz kontaktowy (RHF + Zod, MOCK submit — w MVP loguje do konsoli, w V1 wysyła email)

---

## 14. SEO

### 14.1. Metadata per strona

**Komponent:** `lib/seo/metadata.ts` z helperami:

```ts
export function generateProductMetadata(product: Product): Metadata {
  return {
    title: `${product.title} | zahakowani`,
    description: product.short_description || product.description?.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.short_description,
      images: [product.thumbnail],
      type: "website", // brak product type w OG, ale Schema.org Product w JSON-LD
    },
    alternates: {
      canonical: `https://zahakowani.pl/produkt/${product.handle}`,
    },
  };
}
```

Per typ strony:
- Strona główna: generyczny title + description
- Kategoria: `Haki holownicze | zahakowani` + description z liczby produktów
- Strona produktu: tytuł produktu + parametry w description
- Landing SEO `/haki/skoda/octavia/3`: `Haki holownicze Skoda Octavia 3 | zahakowani`

### 14.2. Structured Data (JSON-LD)

**Komponent:** `lib/seo/structured-data.ts` z generatorami:

```ts
// Strona produktu
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title,
  "image": product.thumbnail,
  "description": product.description,
  "brand": { "@type": "Brand", "name": product.manufacturer },
  "offers": {
    "@type": "Offer",
    "url": canonicalUrl,
    "priceCurrency": "PLN",
    "price": variantPrice,
    "availability": inStock ? "InStock" : "OutOfStock"
  }
}
</script>
```

Plus:
- `BreadcrumbList` na każdej podstronie
- `Organization` w root layout
- `WebSite` na home

### 14.3. Sitemap

`app/sitemap.ts` (Next.js native):
- Strona główna
- Wszystkie kategorie
- Wszystkie produkty (`/produkt/[handle]`)
- Wszystkie landing pages (`/haki/[brand]/[model]/[generation]`)
- Strony statyczne

Generowany z bazy przez query Medusa.

### 14.4. Robots

`app/robots.ts`:
- `User-agent: *`
- `Allow: /`
- `Disallow: /checkout`, `/koszyk`, `/zamowienie-zlozone`
- `Sitemap: https://zahakowani.pl/sitemap.xml`

---

## 15. STATE MANAGEMENT i Auth (MVP)

### 15.1. Brak localStorage

Z guidelines + zasad bezpieczeństwa: **nie używaj localStorage/sessionStorage**. Stan koszyka trzymany w **Medusa session cookie** (Medusa SDK robi to automatycznie).

### 15.2. Wybrany pojazd

Persistencja wybranego pojazdu (VehicleSelectorNavbar pokazuje "Skoda Octavia 3 ▼"):
- W MVP: **URL params** (`?vehicle=gen_xxx`) — wybór trzymany w aktualnym URL-u
- Plus: opcjonalnie **cookie** (`vehicle_preference`) — w Server Components czytane przez Next.js cookies
- Brak localStorage

### 15.3. Auth — guest only w MVP

- Wszystkie zakupy jako guest customer
- Email + telefon = identyfikacja zamówienia
- Brak logowania, brak rejestracji, brak konta klienta
- **TODO V1:** dorzucenie auth (Medusa customer flow)

---

## 16. PERFORMANCE

### 16.1. Obrazki

- `next/image` zawsze
- Format: AVIF/WebP (Next.js auto)
- `priority` dla above-the-fold (Hero, główne zdjęcie produktu)
- `loading="lazy"` (default) dla reszty
- Sizes prop dla responsywności

### 16.2. Fonty

- `next/font` z self-hostingiem
- Font z Figmy (do ustalenia w iteracji 1 z tokenami)
- `display: swap`

### 16.3. Code splitting

- Dynamic import dla `CartDrawer` (ciężki, użytkowany po pierwszym dodaniu)
- Dynamic import dla `lightbox` w galerii
- Dynamic import dla form components w checkout (rzadko używane)

### 16.4. Bundle target

- **First Load JS < 200KB**
- Sprawdzaj `@next/bundle-analyzer` przy większych zmianach
- Każda nowa zależność = uzasadnienie w PR

### 16.5. Core Web Vitals targets

- **LCP** < 2.5s (Hero image z priority)
- **FID/INP** < 200ms
- **CLS** < 0.1 (image dimensions zawsze ustawione)

---

## 17. CLEANUP

Pod koniec Fazy 3:
- Usuń placeholders i TODO komentarze do V1
- Sprawdź czy żadne `console.log` nie zostały w kodzie produkcyjnym
- Sprawdź czy wszystkie linki w nawigacji prowadzą do realnych stron
- Sprawdź czy brak `any` w kodzie

---

## 18. PLAN ITERACJI

**Filozofia:** strona po stronie, sekcja po sekcji. Każda iteracja jest mała, kończy się testem (npm run build + manualne sprawdzenie w przeglądarce) i commit. CC trzyma w kontekście **ten brief + tech-stack-guidelines + raporty Fazy 1 i 2**.

### FAZA 3A: Setup + fundament

| Iteracja | Co | Czas |
|---|---|---|
| 1 | Setup `apps/storefront/` — Next.js 15 + Tailwind + TS strict + shadcn init + `tailwind.config.ts` z tokenami Figmy (CC pobiera tokeny przez MCP Figma jak otworzysz plik) | 2-3h |
| 2 | Atomy UI — Button, Input, Label, Badge, Card, Container, lucide-react ikony | 2h |
| 3 | Stałe biznesowe w `lib/utils/constants.ts` + helper `variant-wiring.ts` + Medusa client setup | 1-2h |
| 4 | Layout: Header (placeholder VehicleSelector), Footer, InfoBar | 2-3h |

### FAZA 3B: Strona główna

| Iteracja | Co | Czas |
|---|---|---|
| 5 | `VehicleSelectorHero` (kaskadowy Brand→Model→Generation, redirect do `/szukaj`) | 3-4h |
| 6 | `HeroSection` z Figma desktop + mobile | 2h |
| 7 | `ProductCard` (Figma v2 z parametrami graficznie) + variant labels z helper | 3-4h |
| 8 | `PopularProductsSection` (mock: ostatnie 8 produktów) | 1-2h |
| 9 | `BrandsSection` (hardcode FEATURED_BRANDS) | 1-2h |
| 10 | `GuidesSection` placeholder + `WhyUsSection` | 1-2h |
| 11 | Composition strony głównej `/page.tsx` + finalny Header z VehicleSelectorNavbar | 1-2h |

### FAZA 3C: Listingi kategorii

| Iteracja | Co | Czas |
|---|---|---|
| 12 | Listing `/haki` — layout + grid ProductCard + paginacja + sortowanie | 2-3h |
| 13 | `CategoryFilters` sidebar dla haków + filtry zakresowe JS-side | 3-4h |
| 14 | Filtry mobile drawer (Sheet) | 1-2h |
| 15 | Listingi `/bagazniki` + `/wiazki-standalone` (kopiuj-modyfikuj z haków) | 2-3h |
| 16 | Landing SEO `/haki/[brand]/[model]/[generation]` | 1-2h |

### FAZA 3D: Wyszukiwanie po pojeździe

| Iteracja | Co | Czas |
|---|---|---|
| 17 | Strona `/szukaj` — cross-category results + button "Zmień samochód" | 2-3h |

### FAZA 3E: Strona produktu

| Iteracja | Co | Czas |
|---|---|---|
| 18 | Strona produktu — layout + `ProductGallery` z lightbox | 3-4h |
| 19 | `VariantSelector` (5 wariantów haka z dynamiczną ceną) + `ProductSpecIcons` | 3h |
| 20 | Tabs: Opis / Parametry / Pasujące pojazdy / Dokumenty + `FitmentList` | 2-3h |
| 21 | `AddToCartButton` + integracja z Medusa cart | 2h |

### FAZA 3F: Koszyk + checkout

| Iteracja | Co | Czas |
|---|---|---|
| 22 | `CartDrawer` (Sheet z animacją Framer Motion) + `CartItem` | 3-4h |
| 23 | Strona `/koszyk` (full view) | 2-3h |
| 24 | Strona `/checkout` — formularz RHF + Zod (sekcje 1-6) | 5-6h |
| 25 | Mock submit + strona `/zamowienie-zlozone` | 1-2h |

### FAZA 3G: Strony statyczne + SEO + performance

| Iteracja | Co | Czas |
|---|---|---|
| 26 | Strony statyczne (MDX): regulamin, polityka, dostawa, kontakt | 2-3h |
| 27 | SEO: `metadata.ts`, structured data, sitemap.ts, robots.ts | 2-3h |
| 28 | Performance audit (Lighthouse, bundle analyzer) + optymalizacje | 2-3h |

### FAZA 3H: Cleanup + raport

| Iteracja | Co | Czas |
|---|---|---|
| 29 | Cleanup zbędnych plików, refactor problem zones, czyszczenie console.log/any | 1-2h |
| 30 | Manualne testy end-to-end (5 scenariuszy zakupu) | 2h |
| 31 | Raport końcowy Fazy 3 (`docs/raports/RAPORT-FAZA-3.md`) | 30 min |

**Razem:** ~30 iteracji × średnio ~3h = **~90h pracy z CC** rozłożone na **5-7 tygodni**.

---

## 19. Co NIE wchodzi w ten brief (przypomnienie)

- Integracja Stripe / Przelewy24 / Tpay → Faza 4
- Integracja InPost / DPD / DHL → Faza 4
- Faktury (Fakturownia / iFirma) → Faza 4
- Email transakcyjny → Faza 4
- Konto klienta + login / register → V1
- Wishlist / recently viewed / related → V1
- Blog Sanity → Faza 5 (placeholder w Fazie 3)
- TrustedShops opinie → Faza 6
- B2B portal → Faza 6
- Wyszukiwarka pełnotekstowa → V1
- Tabela `Manufacturer` z `is_authorized_distributor` → V1 (hardcoded lista w MVP)
- Konfiguracja darmowej dostawy w admin → V1 (hardcoded 450 zł w MVP)
- Realna sekcja "Najczęściej Przeglądane" z tracking → V1 (mock w MVP)
- Realna sekcja Modele z analytics → V1 (hardcoded top 8 w MVP)
- Upload plików w admin (obrazki/PDF) → V1 (URL-e w MVP)
- Rich Text Editor → V1 (Textarea w MVP)

---

## 20. TODO do zapisania (decyzje odłożone do V1)

Lista refaktorów do wykonania po launch MVP. **CC dorzuca komentarze `// TODO V1:` w odpowiednich miejscach w kodzie:**

1. **Najczęściej Przeglądane** — z mock "ostatnie 8 dodanych" → realne tracking (Plausible / GA4 / własny w Medusie)
2. **Sekcja Modele** — z hardcoded FEATURED_BRANDS → automatyczny top 8 na podstawie liczby produktów
3. **Darmowa dostawa** — z hardcoded `FREE_SHIPPING_THRESHOLD_PLN = 450` → konfiguracja w admin
4. **Authorized distributors** — z hardcoded listy → tabela `Manufacturer` z `is_authorized_distributor: boolean`
5. **Ocena produktów** — z placeholder 0,0 → realna integracja TrustedShops (Faza 6)
6. **Konto klienta** — guest only → Medusa customer flow

---

## 21. Walidacja zgodności z guidelines

Przy każdej iteracji CC sprawdza zgodność z `tech-stack-guidelines.md`:

- **§3** (nazewnictwo): kebab-case pliki, PascalCase komponenty
- **§4** (TypeScript strict): zero `any`
- **§5** (architektura): logika w serwisach/utils, Server vs Client świadomie
- **§6** (error handling)
- **§7** (walidacja Zod): jedno źródło prawdy
- **§8** (komentarze): JSDoc dla publicznych
- **§9** (git): commity per iteracja, format `[FAZA-3] opis`
- **§17-25** (frontend): Server-first, Tailwind+shadcn, RHF+Zod, SEO, performance
- **§26** (quirks Medusy): variant.metadata workaround, SKU format, MedusaError serialized
- **§28** (cykl pracy): jedna sekcja briefu = jedna iteracja

---

**Wersja briefu:** 1.0  
**Stan:** Gotowy do iteracyjnej implementacji z Claude Code  
**Zależności:** Faza 1 ✅, Faza 2 ✅, repo gotowe, Figma dostępna, seed katalogu zlecony  
**Kamień milowy:** end-to-end ścieżka zakupowa działa bez integracji
