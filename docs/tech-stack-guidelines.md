# Wytyczne implementacyjne — zahakowani

Dokument referencyjny dla Claude Code. Stały kontekst niezależny od fazy projektu.
Każdy brief implementacyjny (#1, #2, #3, ...) odwołuje się do tych zasad.

---

## 1. Stack technologiczny

### Backend
- **Node.js** — LTS (20.x lub nowsza stable)
- **Medusa.js v2** — najnowsza stable
- **PostgreSQL** — 16
- **Redis** — dla event bus i cache (Medusa wymaga)
- **TypeScript** — strict mode
- **Zod** — walidacja inputu z API

### Frontend (Faza 3+)
- **Next.js 15+** z App Router (server components domyślnie)
- **React 19**
- **TypeScript** strict
- **Tailwind CSS** — fundament stylowania
- **shadcn/ui** — gotowe komponenty kopiowane do repo
- **Material UI** — awaryjnie dla pojedynczych skomplikowanych komponentów (DataGrid, DatePicker)
- **Framer Motion** — animacje skomplikowane
- **React Hook Form + Zod** — formularze + walidacja
- **TanStack Query (React Query)** — data fetching w Client Components

### CMS
- **Sanity** (decyzja zamknięta)

### Tooling
- **npm** (nie yarn, nie pnpm)
- **Docker Compose** — lokalny Postgres + Redis
- **ESLint** — Medusa default preset
- **Prettier** — formatowanie automatyczne
- **Pino** — logger (wbudowany w Medusę)

### Hosting (Faza 5)
- Backend: **Railway** (preferowany dla solo dev)
- Frontend: **Vercel**
- CMS Studio: **Sanity Cloud** (free tier)

---

## 2. Struktura projektu (Medusa backend)

```
src/
├── modules/                     # Custom moduły domeny
│   ├── hook-catalog/
│   │   ├── models/
│   │   ├── services/
│   │   ├── migrations/
│   │   ├── module.ts            # Definicja modułu
│   │   └── index.ts
│   ├── wiring-equipment/
│   ├── bike-rack-catalog/
│   ├── standalone-wiring-catalog/
│   └── vehicle-fitment/
│
├── links/                       # Module Links (relacje między modułami)
│   ├── product-hook.ts
│   ├── product-bike-rack.ts
│   ├── product-standalone-wiring.ts
│   ├── product-generation.ts
│   └── variant-wiring-equipment.ts
│
├── workflows/                   # Logika biznesowa wieloetapowa
│   ├── create-product-from-hook.ts
│   ├── create-product-from-bike-rack.ts
│   └── create-product-from-standalone-wiring.ts
│
├── api/                         # Custom endpointy
│   ├── admin/
│   │   └── workflows/
│   └── store/
│       ├── products/
│       │   └── by-vehicle/
│       │       └── [generationId]/
│       │           └── route.ts
│       └── vehicle-fitment/
│
├── utils/                       # Helpery wspólne
│   └── catalog/
│       ├── generate-title.ts
│       ├── generate-sku.ts
│       └── generate-handle.ts
│
├── validators/                  # Schemy Zod
│   ├── hook.ts
│   ├── bike-rack.ts
│   └── workflows.ts
│
├── scripts/                     # Skrypty pomocnicze
│   ├── test-workflows.ts
│   └── seed.ts
│
└── admin/                       # UI Routes i widgety (Faza 2)
    ├── routes/
    └── widgets/
```

**Zasada:** każdy moduł ma identyczną strukturę wewnętrzną. Przewidywalność > kreatywność.

---

## 3. Konwencje nazewnictwa

| Element | Konwencja | Przykład |
|---|---|---|
| Pliki | `kebab-case.ts` | `hook-catalog.service.ts` |
| Foldery | `kebab-case` | `hook-catalog/` |
| Klasy / modele | `PascalCase` | `Hook`, `HookCatalogService` |
| Funkcje / zmienne | `camelCase` | `generateSku()`, `hookId` |
| Stałe globalne | `UPPER_SNAKE_CASE` | `MAX_PRODUCTS_PER_PAGE` |
| Typy / interfejsy | `PascalCase` | `CreateHookInput`, `HookDTO` |
| Moduły Medusy | `snake_case` (w `module.ts`) | `hook_catalog`, `vehicle_fitment` |
| Nazwy tabel DB | `snake_case` | `hook_catalog`, `vehicle_fitment_generation` |
| Endpointy | `kebab-case` | `/store/by-vehicle/:id` |

---

## 4. TypeScript — strict mode

`tsconfig.json` ma mieć:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Zasady:**
- **Zero `any`** — wszystko typowane. Jeśli typ nieznany, używaj `unknown` + type guards.
- Typy publiczne (eksportowane) — w osobnych plikach `*.types.ts`.
- DTOs (Data Transfer Objects) dla I/O API.
- Inferencja typów z Zod — jeden źródło prawdy między walidacją a typami.

---

## 5. Architektura kodu

### Service Layer Pattern

Logika biznesowa **w serwisach modułu**, nie w endpointach.

❌ **Źle:**
```ts
// /api/admin/hooks/route.ts
export async function POST(req) {
  const { catalog_number, name } = await req.json();
  // bezpośrednia logika tworzenia w endpoincie
  await medusa.db.insert("hook", { catalog_number, name });
}
```

✅ **Dobrze:**
```ts
// /api/admin/hooks/route.ts
export async function POST(req) {
  const input = await req.json();
  const hookService = req.scope.resolve("hookCatalogService");
  const hook = await hookService.create(input);
  return Response.json(hook);
}

// /modules/hook-catalog/services/hook-catalog.service.ts
class HookCatalogService extends MedusaService {
  async create(input: CreateHookInput): Promise<Hook> {
    // logika tu
  }
}
```

### Workflowy dla operacji wieloetapowych

Każda operacja która **modyfikuje wiele encji** lub **może się sypnąć w połowie** → workflow z kompensacjami.

Przykład: `createProductFromHook` tworzy Product + 5 ProductVariant + linki. Jak coś się sypnie w środku, kompensacje cofają wcześniejsze kroki.

### Repository pattern

**Domyślny dla Medusy v2** — nie nadpisywać bez powodu. Medusa generuje repozytoria z modeli automatycznie.

### Funkcje czyste w utilach

`src/utils/` — bezstanowe, deterministyczne. Generator tytułu nie czyta z bazy, dostaje wszystko jako argumenty.

---

## 6. Error handling

### Custom error classes per moduł

```ts
// /modules/hook-catalog/errors.ts
export class HookNotFoundError extends MedusaError {
  constructor(catalogNumber: string) {
    super(
      MedusaError.Types.NOT_FOUND,
      `Hook with catalog_number "${catalogNumber}" not found`
    );
  }
}
```

### Używać Medusowych typów błędów

`MedusaError.Types`:
- `NOT_FOUND` — zasób nie istnieje
- `INVALID_DATA` — niepoprawny input
- `UNAUTHORIZED` — brak autoryzacji
- `CONFLICT` — konflikt danych (np. duplicate SKU)
- `UNEXPECTED_STATE` — coś po stronie systemu

### Kompensacje w workflowach

Każdy step który modyfikuje dane MUSI mieć `compensate` definiujący jak cofnąć.

---

## 7. Walidacja inputu

### Zod schemas w osobnych plikach

```ts
// /validators/hook.ts
import { z } from "zod";

export const createHookSchema = z.object({
  catalog_number: z.string().min(1).max(50),
  name: z.string().min(1),
  manufacturer: z.string().min(1),
  pulling_capacity_kg: z.number().int().positive(),
  // ...
});

export type CreateHookInput = z.infer<typeof createHookSchema>;
```

### Walidacja na poziomie endpointu

```ts
// /api/admin/hooks/route.ts
export async function POST(req) {
  const body = await req.json();
  const validated = createHookSchema.parse(body); // rzuca ZodError jeśli niepoprawne
  // dalej validated jest typowane jako CreateHookInput
}
```

**Jeden źródło prawdy** — Zod schema + inferowany typ.

---

## 8. Komentarze i dokumentacja

### Komentarze w kodzie — po angielsku

```ts
// Generate a unique SKU based on catalog number and variant code
// Returns format: "{catalog_number}-{variant_code}"
export function generateSku(catalogNumber: string, variantCode?: string): string {
  // ...
}
```

### Brak komentarzy "co robi"

Kod ma czytać się sam. Komentuj tylko **dlaczego** dla nieoczywistych decyzji.

❌ **Źle:** `// Increment counter`
✅ **Dobrze:** `// Use INSERT ... ON CONFLICT because parallel webhooks may try to create the same SKU`

### JSDoc dla publicznych API serwisów

```ts
/**
 * Creates a Product with 5 variants from a Hook catalog entry.
 *
 * @param hookId - ID of the source Hook in catalog
 * @param generationIds - Vehicle generations this product fits (creates one Product per generation)
 * @param variantPrices - Manual prices for each of 5 variants (BARE, W7, W13, M7, M13)
 * @returns Created products with variants and links
 * @throws HookNotFoundError if hookId doesn't exist
 */
async createProductFromHook(input: CreateProductFromHookInput): Promise<Product[]>
```

### README per moduł

`src/modules/hook-catalog/README.md` — krótki opis: co moduł robi, jakie są jego główne encje, do czego się linkuje.

---

## 9. Git workflow

### Branche

- `main` — chroniona, zero bezpośrednich pushów
- Feature branches: `feature/faza-X-opis` (np. `feature/faza-1-hook-module`)
- Hotfix branches: `hotfix/opis`
- Każdy merge do `main` przez Pull Request

### Commit messages — po polsku z prefiksem fazy

**Format:** `[FAZA-X] krótki opis`

Przykłady:
- `[FAZA-1] dodanie modułu hook_catalog z modelem i serwisem`
- `[FAZA-1] linki: Product↔Hook, Product↔Generation`
- `[FAZA-1] workflow createProductFromHook z kompensacjami`
- `[FAZA-1] seed 4 WiringEquipment w migracji`
- `[FAZA-1] skrypt testowy test-workflows.ts`
- `[BUGFIX] naprawa walidacji SKU dla wariantów`
- `[CHORE] aktualizacja zależności`

### .gitignore (minimalna lista)

```
node_modules/
.env
.env.*
!.env.example
dist/
build/
.medusa/
*.log
.DS_Store
.next/
```

---

## 10. Performance

### Zapytania do bazy

- **Zawsze konkretne `relations`** — nie eager-load wszystkiego
  ```ts
  // Źle
  const products = await productService.list({}, { relations: ["*"] });
  
  // Dobrze
  const products = await productService.list(
    {},
    { relations: ["variants", "hook", "generations"] }
  );
  ```

- **Paginacja domyślna** — 20 elementów na stronę dla list

### Indexy

- Wszystkie indeksy z briefu obowiązkowe.
- Nowe pole które będzie filtrowane → dodaj indeks w migracji.
- Foreign keys → automatyczny indeks.

---

## 11. Bezpieczeństwo (podstawy)

- Wszystkie endpointy `/admin/*` chronione middleware autoryzacji Medusy
- `/store/*` — publiczne lub z customer session
- Wszystkie inputy walidowane Zodem
- Nigdy nie logować: `password`, `JWT`, `email`, `phone` w plain text
- Secrets w `.env` lub vault, nigdy w kodzie
- `.env.example` w repo z listą zmiennych (puste wartości)

---

## 12. Wytyczne specyficzne dla Claude Code

### Co robić

- **Decyduj samodzielnie** gdy briefy nie precyzują — bez blokowania na pytaniach
- **Trzymaj się konwencji Medusy v2** — nazewnictwo, struktura, typy
- **Generuj migracje przez Medusę** (`npx medusa db:generate`), nie pisz SQL ręcznie
- **Każda zmiana schemy = nowa migracja** — nie modyfikuj istniejących migracji jeśli już były uruchomione
- **Komituj często, małymi krokami** — każdy logiczny krok osobny commit
- **Aktualizuj README modułu** po dodaniu nowej funkcji
- **Pisz strict TypeScript** — wszystko typowane, brak `any`

### Czego nie robić

- **Nie używaj `console.log`** poza skryptami w `src/scripts/` — używaj `logger` Medusy
- **Nie instaluj nowych paczek** bez potrzeby — sprawdź najpierw czy Medusa nie ma tego
- **Nie nadpisuj domyślnych konwencji Medusy** chyba że jest jasny powód (zapisz w komentarzu)
- **Nie pisz testów** w MVP — brief mówi explicite "zero testów do launchu"
- **Nie hardkoduj** danych testowych w kodzie produkcyjnym — wszystko przez seedy w migracjach lub `src/scripts/`
- **Nie kombinuj z autoryzacją** — używaj wbudowanej Medusy

### W razie wątpliwości

Jeśli brief implementacyjny mówi A, ale konwencja Medusy v2 mówi B, **idź za konwencją Medusy** i zostaw komentarz w PR/commit message:

```
[FAZA-1] użyto MedusaService zamiast plain class

Brief sugerował własną klasę bazową, ale Medusa v2 wymaga 
extends MedusaService dla integracji z DI container.
```

---

## 16. Frontend — stack i konwencje

### Stack (uściślenie sekcji 1)

- **Next.js 15+** z App Router (server components domyślnie)
- **React 19**
- **TypeScript** strict
- **Tailwind CSS** — fundament stylowania
- **shadcn/ui** — gotowe komponenty bardziej skomplikowane (kopiujesz do repo, customizujesz)
- **Material UI** — **awaryjnie**, tylko dla pojedynczych komponentów które są nieproporcjonalnie trudne do napisania od zera (DataGrid, DatePicker, Autocomplete z keyboard nav)
- **Framer Motion** — dla animacji skomplikowanych (modale, drawery, transitions między stronami)

### Struktura `apps/storefront/`

```
apps/storefront/
├── src/
│   ├── app/                       # App Router
│   │   ├── (shop)/                # group route — sklepowe strony
│   │   │   ├── page.tsx           # strona główna
│   │   │   ├── haki/
│   │   │   │   ├── page.tsx       # listing haków
│   │   │   │   └── [brand]/
│   │   │   │       └── [model]/
│   │   │   │           └── [generation]/page.tsx
│   │   │   ├── produkt/[handle]/page.tsx
│   │   │   ├── koszyk/page.tsx
│   │   │   └── checkout/page.tsx
│   │   ├── (account)/             # group route — konto klienta
│   │   ├── poradniki/             # blog z Sanity
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                    # atomy designu: Button, Input, Card, Badge
│   │   ├── product/               # ProductCard, VariantSelector, Gallery
│   │   ├── vehicle/               # VehicleSelector, GenerationPicker
│   │   ├── cart/                  # CartDrawer, CartItem
│   │   └── layout/                # Header, Footer, Navigation
│   │
│   ├── lib/
│   │   ├── medusa/                # Medusa SDK config
│   │   ├── sanity/                # Sanity client + queries
│   │   └── utils/                 # cn(), formatPrice() itd.
│   │
│   ├── hooks/                     # custom React hooks (use*)
│   ├── types/                     # współdzielone typy (lub przez packages/types)
│   └── styles/                    # globals.css, font configs
│
├── public/
├── tailwind.config.ts             # tokeny z Figmy (kolory, spacing, typografia)
├── next.config.js
└── package.json
```

---

## 17. Server Components vs Client Components

**Domyślnie wszystko Server Component.** `'use client'` tylko gdy konieczne.

### Server Components (większość)

- Strona główna
- Listingi (haki, bagażniki, wiązki)
- Strony marek / modeli / generacji
- Strona produktu (sam render, bez interakcji wariantów)
- Strony statyczne (regulamin, o nas, dostawa)
- Blog / poradniki
- Layout, Header, Footer (jeśli statyczne)

### Client Components (tam gdzie interakcja)

- `VehicleSelector` — kaskadowy dropdown Brand → Model → Generation
- `VariantSelector` — przełączanie wariantów haka, zmiana ceny
- `CartDrawer` — koszyk z państwem
- `Checkout` — formularze, walidacja, kroki
- `Filters` — filtry per kategoria (checkboxy, zakresy)
- Każdy formularz
- Modale, dropdowny, tooltips, toasty

**Reguła:** komponent jest Client tylko jeśli używa `useState`, `useEffect`, eventów, kontekstu, biblioteki która tego wymaga. Inaczej zostaw jako Server.

---

## 18. Rendering strategy (per typ strony)

| Strona | Strategia | Revalidate | Powód |
|---|---|---|---|
| Strona główna | ISR | 1h | Statyczna, ale newsletter/banner może się zmienić |
| Listing kategorii (`/haki`) | ISR | 5 min | Świeże stany magazynowe, ceny |
| Strona marki/modelu/generacji | ISR | 5 min | jw. |
| Strona produktu (`/produkt/[handle]`) | ISR | 5 min | jw. |
| Strona wariantu | ISR | 5 min | jw. |
| Poradniki — listing | SSG z Sanity webhook | on-demand | Webhook z Sanity przy publikacji |
| Pojedynczy poradnik | SSG z Sanity webhook | on-demand | jw. |
| Koszyk | CSR | — | User-specific |
| Checkout | CSR | — | User-specific, sesja |
| Konto klienta | CSR + middleware auth | — | Wymaga sesji |
| Regulamin, dostawa, o nas | SSG | — | Statyczne, nie zmienia się |

### On-demand revalidation z Sanity

Sanity wysyła webhook do `/api/revalidate` przy każdej zmianie contentu. Next.js robi rebuild stron blog/poradników. Brak `revalidate` z timera — tylko na żądanie.

---

## 19. Data fetching

### W Server Components — bezpośredni fetch

```ts
// app/produkt/[handle]/page.tsx (Server Component)
import { sdk } from "@/lib/medusa";

export default async function ProductPage({ params }) {
  const product = await sdk.store.product.retrieve(params.handle);
  return <ProductDetails product={product} />;
}
```

### W Client Components — React Query (TanStack Query)

Standardowa biblioteka do cache + refetch + optimistic updates.

```tsx
'use client';
import { useQuery, useMutation } from '@tanstack/react-query';

function CartDrawer() {
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => sdk.store.cart.retrieve(),
  });
  
  const addItem = useMutation({
    mutationFn: (variantId: string) => sdk.store.cart.addItem(cart.id, { variantId }),
    onSuccess: () => queryClient.invalidateQueries(['cart']),
  });
}
```

### Konfiguracja

`QueryClient` w root layout jako Client Component wrapper:
```tsx
// app/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 }, // 1 min cache
  }
});

export function Providers({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

---

## 20. Stylowanie

### Tailwind jako fundament

- Każdy komponent stylowany przez utility classes Tailwinda
- Tokeny designu (kolory, spacing, typografia, shadows, breakpoints) w `tailwind.config.ts` — wyeksportowane z Figmy w Fazie 3
- Brak custom CSS plików (poza `globals.css` z resetami i font-face)

### shadcn/ui jako "kopiuj-wklej"

Dla komponentów bardziej skomplikowanych których nie chcemy pisać od zera:
- Dialog / Modal
- Dropdown Menu
- Combobox / Autocomplete
- Toast / Notification
- Tooltip
- Popover
- Sheet / Drawer
- Accordion
- Tabs

Komponenty żyją w `apps/storefront/src/components/ui/` jako TWÓJ KOD — możesz dowolnie modyfikować.

### Material UI — awaryjnie

Tylko dla pojedynczych komponentów które są nieproporcjonalnie trudne do napisania od zera. Konkretnie:
- **DataGrid** — sortowalna, filtrowalna, paginowana tabela (np. listing zamówień w panelu klienta)
- **DatePicker** — z keyboard nav, accessibility, lokalizacją
- **Autocomplete z wirtualnym scrollingiem** — gdy mamy 5000+ opcji do przewinięcia

Reguła: importuj tylko konkretny komponent (`import { DataGrid } from '@mui/x-data-grid'`), nie całą bibliotekę. Tree-shaking ogranicza overhead.

**Domyślnie nie używasz MUI.** Tylko jak konkretny komponent okaże się zbyt drogi do napisania samemu.

### Animacje

**Tailwind transitions** dla 90% przypadków:
- Hover effects (`hover:bg-...`)
- Focus states (`focus:ring-...`)
- Proste przejścia (`transition-colors duration-200`)
- Loading states (`animate-pulse`, `animate-spin`)

**Framer Motion** dla skomplikowanych:
- Modal koszyka (slide z prawej, easing)
- Drawer mobilny
- Transitions między stronami (jeśli będziemy chcieli)
- Slider produktów / galeria
- Stagger animations (lista elementów pojawia się po kolei)

---

## 21. Formularze

**Stack:** React Hook Form + Zod (walidacja)

Zod schemas dzielone między backendem a frontendem przez `packages/types` w monorepo. Jedno źródło prawdy.

```tsx
// packages/types/src/checkout.ts
export const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  // ...
});

// apps/storefront — używamy
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema } from '@zahakowani/types';

function CheckoutForm() {
  const { register, handleSubmit } = useForm({ resolver: zodResolver(checkoutSchema) });
}
```

---

## 22. SEO i metadata

Każda strona w App Router ma `generateMetadata()` zwracający:
- `title`
- `description`
- `openGraph` (image, title, description)
- `alternates.canonical` — szczególnie ważne dla wariantów produktu
- `robots` (gdzie potrzeba)

Structured data (JSON-LD) dla:
- `Product` schema na stronie produktu (z aktualnym wariantem)
- `BreadcrumbList` na wszystkich podstronach
- `Article` na poradnikach
- `Organization` w layout

Sitemap generowana w `app/sitemap.ts` (Next.js native).

---

## 23. Internacjonalizacja

**MVP: tylko polski.** Bez i18n setup.

Jeśli kiedyś będziemy chcieli eksport (np. czeski, niemiecki) — retrofitujemy strukturę URL-i (`/pl/`, `/cs/`, `/de/`). Next.js wspiera to przez `i18n` config. Tani refaktor, niewart robienia teraz.

---

## 24. Performance — wytyczne

### Obrazki

- **next/image** zawsze, nigdy zwykły `<img>`
- Format WebP / AVIF (Next.js robi automatycznie)
- `priority` dla obrazków above-the-fold
- `loading="lazy"` (domyślne) dla reszty

### Fonty

- **next/font** zawsze, nigdy zwykły link z Google Fonts
- Self-hosting fontów (next/font to ogarnia)
- `display: swap` (next/font domyślnie)

### Code splitting

- `dynamic()` import dla komponentów ciężkich, używanych rzadko (np. mapa Google na stronie kontakt, edytor WYSIWYG)
- `lazy()` dla komponentów warunkowych

### Bundle size

- Sprawdzaj `@next/bundle-analyzer` przy większych zmianach
- Cel: First Load JS < 200KB
- Każda nowa zależność wymaga uzasadnienia w PR

---

## 25. Authentication (customer flow)

Medusa ma natywne customer accounts. Frontend używa:

- **Login / Register** — formularze gadające z `/store/auth`
- **Sesja** — JWT w cookie (HTTP-only, secure)
- **Middleware Next.js** w `middleware.ts` chroni `/konto/*` (redirect na `/login` jeśli brak sesji)
- **Logout** — czyszczenie cookie

Brak OAuth / social login w MVP. Można dodać w V1 jeśli będzie potrzeba.

---

## 26. Znane quirks Medusy 2.15.2 (z Fazy 1)

Te zachowania zostały odkryte w Fazie 1 i są **stałym kontekstem dla wszystkich kolejnych faz.** CC musi o nich pamiętać przy implementacji UI, frontu i integracji.

### 29.1. Variant ↔ Custom Module link

**Problem:** `link.create()` rzuca `"Cannot create multiple links between 'product' and 'X'"` przy próbie linkowania `ProductVariant` z custom modułem (np. `WiringEquipment`). Bug w Medusa 2.15.2 — link service nie rozróżnia Product vs ProductVariant pod tym samym `serviceName: "product"`.

**Workaround:** Dane zapisywane w `variant.metadata` jako jsonb. Konkretnie dla haka:
```ts
variant.metadata = {
  wiring_equipment_id: "we_xxx",
  wiring_equipment_code: "M13"
}
```

**Konsekwencje:**
- Admin UI czyta `variant.metadata.wiring_equipment_id` żeby pokazać który moduł jest powiązany
- Frontend renderuje galerię/spec wariantu z `variant.metadata.wiring_equipment_id`
- Brak natywnego query Medusa po linku — trzeba albo indexować jsonb (GIN), albo joinować w aplikacji

**Plan:** sprawdzić Medusa 2.16+ przy upgrade, wpiąć prawdziwy link gdy bug naprawiony.

### 29.2. Module Link M:N — `isList: true` po obu stronach

**Pułapka:** definiując link M:N (np. `Product ↔ Generation`), `isList: true` musi być **na obu linkable'ach**, nie tylko po jednej stronie. Bez tego query w jedną stronę działa, w drugą rzuca `"Entity X does not have property Y"`.

**Reguła:** każdy nowy link M:N → `isList: true` po obu stronach.

### 29.3. Enum tylko dla valid identifiers

**Problem:** `model.enum(["7", "13"])` lub `model.enum(["7-pin", "13-pin"])` rzuca błąd GraphQL — enum values muszą być valid identifiers (litera na początku, bez myślników).

**Reguła:**
- Pola które są enum z "ludzkimi" wartościami → `model.text()` + walidacja Zod na poziomie endpointu
- Pola które są enum z valid identifiers (np. `"harness" | "module"`) → `model.enum([...])`

### 29.4. `model.number()` = integer, nie float

**Problem:** `model.number()` w Medusa 2.15.2 mapuje na PG `integer`. Brak natywnej opcji float/decimal.

**Reguła:**
- Wartości całkowite (kg, ilość) → `model.number()` OK
- Wartości dziesiętne (cena, waga z gramami) → ostrożnie:
  - Cena: użyj `model.bigNumber()` (built-in dla pieniędzy)
  - Inne dziesiętne: integer × 100 i dzielenie na froncie, albo refactor do `model.text()` z parsowaniem

### 29.5. Single-variant produkt wymaga ProductOption

**Problem:** Medusa core `createProductsWorkflow` rzuca `"Product options are not provided"` nawet dla produktów bez wariantowości.

**Reguła:** każdy `Product` musi mieć minimum jedną `ProductOption` z minimum jedną wartością. Dla produktów single-variant używamy dummy:
```ts
options: [{ title: "Wariant", values: ["Standardowy"] }]
variant: { options: { Wariant: "Standardowy" } }
```

Admin UI ukrywa tę opcję dla single-variant produktów (bagażniki, wiązki standalone).

### 29.6. `query.graph` z głębokimi nested linkami zawodzi

**Problem:** query w stylu `brand → models → generations → products` rzucają `"Cannot read properties of undefined (reading 'strategy')"` w Medusa 2.15.2.

**Workaround:** rozdzielenie na 2 query (entity-level + relacja) i agregacja w JS. Funkcjonalnie to samo, ale bardziej rozwlekłe.

### 29.7. Filtr po linkowanej encji na product nie działa

**Problem:** `product` z filtrem typu `filters: { generations: { id }}` rzuca 500.

**Workaround:** query od strony `generation` → pobierz `products.id` → fetch products po liście ID.

### 29.8. Filtry zakresowe (`$gte`, `$lte`) — JS-side

**Stan:** Medusa Query nie wspiera natywnie operatorów zakresowych w stable. Endpointy listing filtrują w JS po pobraniu z DB.

**Konsekwencja:** OK do kilkuset produktów. Powyżej 1000+ → refactor na natywne micro-orm operatory lub raw SQL.

### 29.9. SKU musi być globalnie unique w Medusa

**Problem:** ten sam `catalog_number` w wielu produktach (np. Hak Z/016 dla różnych aut) generuje konflikt SKU jeśli format to tylko `Z/016-{variant_code}`.

**Reguła:** Format SKU dla per-generation produktów:
```
{catalog_number}-{generation_code}-{variant_code}
```
Przykład: `Z/016-OCTAVIA-3-M13`

Dla globalnych produktów (BikeRack, StandaloneWiring uniwersalny) wystarczy `{catalog_number}` lub `{catalog_number}-{generation_code}`.

### 29.10. Redis fallback do in-memory w dev

**Stan:** Medusa nie czyta `REDIS_URL` z `.env` automatycznie dla modułów `event_bus`, `cache`, `workflow_engine`. Bez konfiguracji → in-memory fallback z warningiem `"not recommended for production"`.

**Plan:** dodać do `medusa-config.ts` przed Fazą 4 (integracje):
```ts
{ resolve: "@medusajs/event-bus-redis", options: { redisUrl: process.env.REDIS_URL } },
{ resolve: "@medusajs/cache-redis", options: { redisUrl: process.env.REDIS_URL } },
{ resolve: "@medusajs/workflow-engine-redis", options: { redis: { url: process.env.REDIS_URL } } },
```

W dev OK z fallbackiem. Na prod obowiązkowo Redis.

### 29.11. Workflow SDK serializuje MedusaError do plain object (z Fazy 2)

**Problem:** Gdy workflow `createProductFrom*` rzuca `new MedusaError(NOT_FOUND, "...")` ze step'u, do endpointu trafia **plain object** z polem `__isMedusaError: true`, NIE instancja `MedusaError`. Przez to:
- `err instanceof MedusaError` → `false`
- `err instanceof Error` → też `false` (plain object)
- Pole `err.message` jest jednak prawidłowym stringiem
- Pole `err.type` zawiera typ (`"not_found"`, `"invalid_data"`, etc.)

**Workaround:** helper wykrywa marker `__isMedusaError === true` i `type` typu string → mapuje na odpowiedni HTTP status.

```typescript
type SerializedMedusaError = {
  __isMedusaError: true
  type: string
  message: string
  code?: string
}

function isSerializedMedusaError(e: unknown): e is SerializedMedusaError {
  return (
    typeof e === "object" && e !== null
    && "__isMedusaError" in e && e.__isMedusaError === true
    && typeof (e as { type?: unknown }).type === "string"
    && typeof (e as { message?: unknown }).message === "string"
  )
}
```

**Wzór implementacji:** `apps/medusa/src/api/admin/catalog/_helpers.ts` (Faza 2) — `mapPublishError()`.

**Konsekwencje dla frontendu (Faza 3):**
- Storefront wywołujący endpoint który wewnętrznie odpala workflow musi obsłużyć ten kształt błędu
- Dotyczy głównie integracji płatności w Fazie 4 (Stripe webhook → workflow → potencjalny błąd)

**Plan:** sprawdzić Medusa 2.16+ przy upgrade — być może naprawione.

---

## 27. Logger (Pino przez Medusę)

```ts
// W serwisie / endpoincie
import { Logger } from "@medusajs/framework/types";

class HookCatalogService extends MedusaService {
  constructor(container) {
    super(container);
    this.logger_ = container.logger;
  }
  
  async create(input) {
    this.logger_.info(`Creating hook with catalog_number ${input.catalog_number}`);
    // ...
    this.logger_.debug({ hookId: hook.id }, "Hook created successfully");
  }
}
```

**Poziomy:**
- `error` — błędy które wymagają uwagi
- `warn` — coś niepokojącego ale nie kładzie systemu
- `info` — ważne wydarzenia biznesowe (utworzony produkt, opłacone zamówienie)
- `debug` — szczegóły do debugowania (wyłączone na prod)

**Nigdy:**
- `console.log` poza scriptami
- Logowanie wrażliwych danych

---

## 28. Cykl pracy z Claude Code (typowa iteracja)

### Zasada podstawowa: jedna sekcja briefu = jedna iteracja

**Claude Code lepiej pracuje na małych, skupionych zadaniach niż na wielkich.** Wrzucanie całego briefu naraz prowadzi do:
- gubienia kontekstu w środku pracy
- mieszania konwencji (np. wymyśla własną strukturę zamiast tej z guidelines)
- pomijania szczegółów z początku briefu
- "optymalizowania" rzeczy które miały być proste
- robienia rzeczy z innej sekcji niż prosisz

**Dlatego pracujesz iteracyjnie.**

### Procedura iteracji

1. Wrzucasz `tech-stack-guidelines.md` jako stały kontekst (zawsze)
2. Mówisz: **"Zaimplementuj sekcję X briefu Y"** (jedna sekcja, nie więcej)
3. CC generuje pliki tylko dla tej sekcji
4. CC commituje (`[FAZA-X] opis`)
5. **Ty sprawdzasz:**
   - Czy `npm run dev` / `npm run build` działa
   - Czy migracja przeszła (jeśli były zmiany w schemie)
   - Czy struktura plików zgadza się z guidelines
   - Czy konwencje nazewnictwa są zachowane
6. Jeśli błąd → wracasz do CC z konkretnym opisem co nie działa
7. Jeśli OK → następna iteracja (sekcja X+1)

### Czego NIE robić

❌ "Zaimplementuj cały brief #1"  
❌ "Zrób Fazę 1 od początku do końca"  
❌ "Zbuduj wszystkie moduły naraz"  
❌ Pomijać testowania między iteracjami  
❌ Wrzucać brief #1 + brief #2 + brief #3 jednocześnie do kontekstu  

### Co robić

✅ "Zaimplementuj sekcję 1 briefu #1: moduł `vehicle_fitment`"  
✅ "Następnie zaimplementuj sekcję 2: moduł `hook_catalog`"  
✅ Test po każdej iteracji przed następną  
✅ Jeden brief + ten guidelines w kontekście — nic więcej  

### Przykład: jak rozbić Fazę 1 na iteracje

Brief #1 v2.1 ma 17 sekcji. Rozbijasz na ~13 iteracji:

| Iteracja | Co | Czas |
|---|---|---|
| 1 | Sekcja 1 — moduł `vehicle_fitment` (Brand, VehicleModel, Generation) | 1-2h |
| 2 | Sekcja 2 — moduł `hook_catalog` | 1-2h |
| 3 | Sekcja 3 — moduł `wiring_equipment` + seed 4 rekordów | 1h |
| 4 | Sekcja 4 — moduł `bike_rack_catalog` | 1h |
| 5 | Sekcja 5 — moduł `standalone_wiring_catalog` | 1h |
| 6 | Sekcja 6 — Module Links (5 linków) | 1h |
| 7 | Sekcja 8 — Shared utilities (helpery generowania tytułu/SKU) | 1h |
| 8 | Sekcja 9.1 — workflow `createProductFromHook` | 2-3h |
| 9 | Sekcje 9.2, 9.3 — workflowy `createProductFromBikeRack` i `createProductFromStandaloneWiring` | 1-2h |
| 10 | Sekcja 10.1 — API endpointy vehicle fitment + cross-category search | 2h |
| 11 | Sekcje 10.2, 10.3 — endpointy listingu + SEO landing pages | 1-2h |
| 12 | Sekcja 11 — indexy Postgres w migracjach | 30 min |
| 13 | Sekcje 15, 16 — seed testowych danych + skrypt `test-workflows.ts` | 1-2h |

**Razem: ~15-20h pracy z CC** rozłożone na 2-3 tygodnie z testowaniem między iteracjami.

### Gdy CC odpłynie

Jak zauważysz że CC:
- Wymyśla rzeczy spoza briefu
- Zmienia struktury z poprzednich iteracji
- Generuje pliki w niewłaściwych miejscach
- "Optymalizuje" już działające rzeczy

**Stop. Otwórz nowy chat z CC.** Wrzuć ponownie guidelines + tylko aktualną sekcję briefu. To często wystarcza — świeży kontekst, świeży start.

---

## 29. Co aktualizujemy z czasem

Ten dokument **żyje** — jak okaże się że jakaś konwencja przeszkadza lub trzeba dorzucić nową regułę, aktualizujesz tu, nie w briefach.

**Reguły aktualizacji:**
- Większa zmiana (np. dodanie biblioteki) → wpisz w sekcję, oznacz datą zmiany
- Refaktor sekcji → zapisz w changelogu na końcu
- Brief odwołujący się do starej wersji → priorytet ma najnowsza wersja tego dokumentu

---

## Changelog

| Wersja | Data | Zmiany |
|---|---|---|
| 1.0 | start projektu | Pierwsza wersja, wszystkie 15 sekcji ogólnych |
| 1.1 | po decyzjach frontendowych | Dorzucone sekcje 16-25 dla frontendu (Next.js, Tailwind + shadcn, Framer Motion, React Query, React Hook Form + Zod, SSG/ISR strategie, Server vs Client Components, SEO, Performance, Authentication, brak i18n) |
| 1.2 | po wskazówce o iteracyjnej pracy | Rozbudowana sekcja 27 — jak pracować z CC po jednej sekcji briefu, rozbicie Fazy 1 na 13 iteracji, co robić gdy CC odpłynie |
| 1.3 | po zakończeniu Fazy 1 (2026-05-16) | Dodana sekcja 26 — 10 znanych quirks Medusy 2.15.2 z Fazy 1 (variant link workaround, M:N isList, enum constraints, integer number, single-variant option, query.graph limits, JS-side filtering, SKU uniqueness, Redis fallback) |
| 1.4 | po zakończeniu Fazy 2 (2026-05-16) | Dodany quirk §26.11 — workflow SDK serializuje MedusaError do plain object (z Fazy 2). Wzór `mapPublishError` jako helper. |

---

**Wersja:** 1.4  
**Status:** Stały kontekst dla Claude Code w każdej fazie
