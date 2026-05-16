# Brief #2: Admin UI Medusa v2 — zahakowani (v1.0)

Implementacja panelu administracyjnego dla Fazy 2. Cel: **wystawianie produktów we wszystkich 3 kategoriach przez UI w 30 sekund**, bez tykania API ręcznie.

**Kontekst wymagany dla CC:**
- `zahakowani-tech-stack-guidelines.md` v1.3 — szczególnie sekcja 26 (quirks Medusy 2.15.2)
- `zahakowani-raport-faza-1.md` — rzeczywista struktura która powstała
- Ten dokument

---

## 0. Stack i konwencje

- Medusa v2 Admin Extensions: **UI Routes** (`src/admin/routes/`) i **Widgets** (`src/admin/widgets/`)
- Komponenty: **`@medusajs/ui`** (natywna biblioteka — Button, Input, Container, Table, etc.)
- Stylowanie: **Tailwind** (Medusa Admin ma już skonfigurowany)
- Forms: **React Hook Form + Zod**
- Routing: pliki `page.tsx` w odpowiedniej strukturze folderów
- Język UI: **polski** (wszystkie labels, buttons, messages po polsku)
- Naming: zgodnie z `tech-stack-guidelines.md` sekcja 3

---

## 1. Struktura plików admin

```
apps/medusa/src/admin/
├── routes/
│   ├── hooks/                          # /admin/hooks
│   │   ├── page.tsx                    # listing
│   │   ├── create/page.tsx             # formularz nowego haka
│   │   └── [id]/page.tsx               # szczegóły/edycja
│   ├── bike-racks/
│   │   ├── page.tsx
│   │   ├── create/page.tsx
│   │   └── [id]/page.tsx
│   ├── standalone-wiring/
│   │   ├── page.tsx
│   │   ├── create/page.tsx
│   │   └── [id]/page.tsx
│   ├── wiring-equipment/               # /admin/wiring-equipment
│   │   ├── page.tsx                    # listing 4 rekordów (no create/delete)
│   │   └── [id]/page.tsx               # edycja
│   └── vehicles/                       # /admin/vehicles
│       ├── page.tsx                    # listing Brand → Model → Generation tree
│       ├── brands/
│       │   ├── create/page.tsx
│       │   └── [id]/page.tsx
│       ├── models/
│       │   ├── create/page.tsx
│       │   └── [id]/page.tsx
│       └── generations/
│           ├── create/page.tsx
│           └── [id]/page.tsx
│
├── widgets/
│   ├── product-hook-info.tsx           # widget na stronie /admin/products/:id
│   ├── product-fitment-info.tsx        # widget z pasującymi pojazdami
│   └── catalog-publish-button.tsx      # widget z przyciskiem "Wystaw produkt" na stronie Hook/BikeRack/SW
│
└── components/                         # współdzielone komponenty
    ├── vehicle-picker/
    │   └── index.tsx                   # kaskadowy Brand → Model → Generation + "Zaznacz wszystkie"
    ├── text-autocomplete/
    │   └── index.tsx                   # input z autocomplete wartości z listy
    ├── catalog-form/
    │   ├── hook-form.tsx
    │   ├── bike-rack-form.tsx
    │   └── standalone-wiring-form.tsx
    ├── publish-product-modal/
    │   └── index.tsx                   # modal "Wystaw produkt" + wybór generacji + ceny + stany
    └── data-table/
        └── index.tsx                   # uniwersalna tabela z paginacją, sortowaniem, filtrowaniem
```

---

## 2. Wymagane admin endpointy do triggera workflowów

W Fazie 1 workflowy istnieją w `src/workflows/`, ale brakuje endpointów admin do ich odpalenia. Trzeba dodać:

### 2.1 Endpointy

| Endpoint | Metoda | Body | Wywołuje |
|---|---|---|---|
| `/admin/catalog/publish-hook` | POST | `{ hookId, generationIds[], variantPrices, variantInventory, status }` | `createProductFromHookWorkflow` |
| `/admin/catalog/publish-bike-rack` | POST | `{ bikeRackId, price, inventory, status }` | `createProductFromBikeRackWorkflow` |
| `/admin/catalog/publish-standalone-wiring` | POST | `{ wiringId, generationIds?, price, inventory, status }` | `createProductFromStandaloneWiringWorkflow` |

### 2.2 Lokalizacja
`apps/medusa/src/api/admin/catalog/publish-hook/route.ts` itd.

### 2.3 Walidacja
Każdy endpoint waliduje body przez Zod schema (`src/validators/publish-*.ts`). W razie błędu zwraca 400 z details.

### 2.4 Response
```ts
// Sukces
{
  success: true,
  productsCreated: number,
  productIds: string[]
}

// Błąd workflow
{
  success: false,
  error: string,
  step?: string  // który step workflow padł
}
```

---

## 3. UI Route: `/admin/hooks` (katalog haków)

### 3.1 Listing (`/admin/hooks/page.tsx`)

**Layout:**
- Header z tytułem "Katalog haków" + przycisk "Dodaj hak" (link do `/admin/hooks/create`)
- Filtry: producent (autocomplete), homologacja (autocomplete), uciąg min/max
- Tabela z kolumnami:
  - Nr katalogowy
  - Nazwa
  - Producent
  - Uciąg (kg)
  - Nacisk (kg)
  - Liczba pasujących aut (count)
  - Akcje (Edytuj, Wystaw produkt, Usuń)

**Funkcjonalność:**
- Paginacja (20 per strona)
- Sortowanie po wszystkich kolumnach
- Klik na wiersz → `/admin/hooks/:id`
- Klik "Wystaw produkt" → otwiera modal `PublishProductModal` z kontekstem Hook

**Endpoint danych:**
Wykorzystaj `MedusaService` haków przez container w loaderze. Pattern:
```ts
export const loader = async ({ container }) => {
  const hookService = container.resolve("hookCatalogService")
  const hooks = await hookService.listHooks({ /* filters */ }, {
    relations: [],
    skip: page * 20,
    take: 20,
  })
  return { hooks }
}
```

### 3.2 Formularz tworzenia (`/admin/hooks/create/page.tsx`)

**Pola formularza** (per brief #1 + raport § 10):

| Pole | Typ | Wymagane | Komponent |
|---|---|---|---|
| catalog_number | text | tak | Input |
| name | text | tak | Input |
| manufacturer | text | tak | **TextAutocomplete** (wartości z istniejących rekordów Hook + BikeRack + SW) |
| manufacturer_catalog_number | text | nie | Input |
| pulling_capacity_kg | number | tak | Input number, min 0 |
| vertical_load_kg | number | tak | Input number, min 0 |
| homologation | text | tak | **TextAutocomplete** (wartości z istniejących) |
| ball_type | text | tak | **TextAutocomplete** |
| requires_bumper_cutting | boolean | tak | Switch / Checkbox |
| warranty_years | number | tak | Input number, default 2 |
| weight_kg | number | tak | Input number, min 0 |
| description_html | text | tak | **Rich Text Editor** lub Textarea |
| short_description | text | nie | Textarea |
| thumbnail | text | tak | Input URL (na razie, w V1 dodamy uploader) |
| gallery | json | tak | TextArea (JSON array URL-i, na razie) lub komponent "lista URL-i" |
| installation_manual_url | text | nie | Input URL |
| certificate_url | text | nie | Input URL |

**Walidacja Zod:**
`src/validators/hook.ts`:
```ts
export const createHookSchema = z.object({
  catalog_number: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  manufacturer: z.string().min(1).max(100),
  manufacturer_catalog_number: z.string().max(100).optional().nullable(),
  pulling_capacity_kg: z.number().int().positive(),
  vertical_load_kg: z.number().int().positive(),
  homologation: z.string().min(1).max(20),
  ball_type: z.string().min(1).max(50),
  requires_bumper_cutting: z.boolean(),
  warranty_years: z.number().int().min(0).max(20).default(2),
  weight_kg: z.number().int().positive(),
  description_html: z.string().min(1),
  short_description: z.string().optional().nullable(),
  thumbnail: z.string().url().min(1),
  gallery: z.array(z.string().url()).default([]),
  installation_manual_url: z.string().url().optional().nullable(),
  certificate_url: z.string().url().optional().nullable(),
})
```

**Submit:**
POST do `/admin/hooks/` (Medusa auto-generuje endpoint z `MedusaService`). Po sukcesie → redirect na `/admin/hooks/:id`.

### 3.3 Edycja (`/admin/hooks/[id]/page.tsx`)

Identyczny formularz jak create, ale:
- Pola pre-filled z istniejącego rekordu
- Przycisk "Zapisz zmiany" zamiast "Dodaj"
- Dodatkowo: panel **"Pasujące pojazdy"** (lista Generation z możliwością dodania/usunięcia)
- Dodatkowo: panel **"Wystawione produkty"** (lista Productów które mają link do tego Hooka)
- Dodatkowo: panel **"Wystaw produkt"** z przyciskiem otwierającym `PublishProductModal`
- Przycisk "Usuń hak" na dole (z confirmation modal)

---

## 4. UI Route: `/admin/bike-racks` (bagażniki rowerowe)

### 4.1 Listing

Analogiczny do `/admin/hooks` ale z kolumnami:
- Nr katalogowy
- Nazwa
- Producent
- Maks. rowerów
- Maks. ładowność (kg)
- Akcje

### 4.2 Formularz create/edit

**Pola:**

| Pole | Typ | Wymagane | Komponent |
|---|---|---|---|
| catalog_number | text | tak | Input |
| name | text | tak | Input |
| manufacturer | text | tak | TextAutocomplete |
| max_bikes | number | tak | Input number, min 1 |
| max_bike_weight_kg | number | tak | Input number |
| max_total_load_kg | number | tak | Input number |
| power_socket | text z allowed values | tak | **Select** z opcjami `7-pin` / `13-pin` (Zod waliduje) |
| weight_kg | number | tak | Input number |
| length_cm | number | tak | Input number |
| has_lockable_attachment | boolean | tak | Switch |
| has_rear_lights | boolean | tak | Switch |
| has_tilt_function | boolean | tak | Switch |
| tool_free_assembly | boolean | tak | Switch |
| warranty_years | number | tak | default 2 |
| description_html | text | tak | Rich Text / Textarea |
| short_description | text | nie | Textarea |
| thumbnail | text | tak | Input URL |
| gallery | json | tak | lista URL-i |
| installation_manual_url | text | nie | Input URL |

**Walidacja Zod:** analogiczna, plus `power_socket: z.enum(["7-pin", "13-pin"])`.

### 4.3 Edycja
- Pola pre-filled
- Brak panelu "Pasujące pojazdy" (bagażnik nie ma fitmentu)
- Panel "Wystawione produkty" + przycisk "Wystaw produkt" (z modalem dla bagażnika — tylko cena + stan, bez generacji)

---

## 5. UI Route: `/admin/standalone-wiring` (wiązki/moduły standalone)

### 5.1 Listing

Kolumny:
- Nr katalogowy
- Nazwa
- Producent
- Typ (Wiązka / Moduł)
- Pin count
- Uniwersalny (badge "TAK" jeśli `fits_all_vehicles`)
- Akcje

### 5.2 Formularz create/edit

**Pola:**

| Pole | Typ | Wymagane | Komponent |
|---|---|---|---|
| catalog_number | text | tak | Input |
| name | text | tak | Input |
| manufacturer | text | tak | TextAutocomplete |
| type | enum | tak | **Select** `harness` / `module` |
| pin_count | text z allowed values | tak | **Select** `7` / `13` |
| weight_kg | number | tak | Input number |
| has_fog_lights | boolean | tak | Switch |
| has_reverse_lights | boolean | tak | Switch |
| has_stop_lights | boolean | tak | Switch |
| has_indicators | boolean | tak | Switch |
| homologation | text | tak | TextAutocomplete |
| warranty_years | number | tak | default 2 |
| **fits_all_vehicles** | boolean | tak | **Switch** — kluczowe pole |
| description_html | text | tak | Rich Text / Textarea |
| short_description | text | nie | Textarea |
| thumbnail | text | tak | Input URL |
| gallery | json | tak | lista URL-i |
| installation_manual_url | text | nie | Input URL |

**Walidacja Zod:** `type: z.enum(["harness", "module"])`, `pin_count: z.enum(["7", "13"])`.

### 5.3 Edycja

- Pola pre-filled
- **Warunkowy panel "Pasujące pojazdy"** — pokazuje się TYLKO jeśli `fits_all_vehicles = false`
  - Lista Generation z możliwością dodania/usunięcia
  - Komponent `VehiclePicker` z opcją "Zaznacz wszystkie auta"
- Jeśli `fits_all_vehicles = true` → panel pokazuje notatkę "Produkt uniwersalny — pasuje do wszystkich aut"
- Panel "Wystawione produkty" + przycisk "Wystaw produkt"

---

## 6. UI Route: `/admin/wiring-equipment`

### 6.1 Listing

**Specjalny przypadek** — 4 stałe rekordy (W7, W13, M7, M13). Nie można tworzyć ani usuwać, tylko edytować.

Tabela z 4 wierszami, kolumny:
- Code (W7 / W13 / M7 / M13)
- Type (Wiązka / Moduł)
- Pin count
- Homologacja
- Waga
- Akcja (tylko Edytuj)

### 6.2 Edycja (`/admin/wiring-equipment/[id]/page.tsx`)

**Pola edytowalne:**
- name (np. "Wiązka 13-Pin")
- weight_kg
- description_html
- has_fog_lights, has_reverse_lights, has_stop_lights, has_indicators
- homologation
- gallery (lista URL-i)

**Pola TYLKO DO ODCZYTU:**
- code (W7/W13/M7/M13)
- type (harness/module)
- pin_count (7/13)

**Powód:** zmiana tych pól rozwaliłaby istniejące produkty które linkują do tego rekordu przez metadata.

---

## 7. UI Route: `/admin/vehicles` (drzewo pojazdów)

### 7.1 Listing (`/admin/vehicles/page.tsx`)

**Widok drzewa:**
```
🚗 Marki
├─ Skoda (3 modele, 12 generacji, 45 produktów)
│  ├─ Octavia
│  │  ├─ Octavia 3 (2013-2019) — 15 produktów
│  │  └─ Octavia 4 (2020-obecnie) — 8 produktów
│  ├─ Fabia
│  └─ ...
├─ Ford
└─ ...
```

Komponenty:
- Każda marka rozwijana (accordion)
- Każdy model rozwijany w obrębie marki
- Przyciski "Dodaj markę", "Dodaj model" (przy każdej marce), "Dodaj generację" (przy każdym modelu)
- Akcje przy każdym poziomie (Edytuj, Usuń)

**Endpoint danych:**
Wykorzystaj istniejący `/store/vehicle-fitment/lookup` (z Fazy 1) lub stwórz analogiczny `/admin/vehicle-fitment/tree` zwracający pełne drzewo + product_count per generacja.

### 7.2 CRUD podstron

**`/admin/vehicles/brands/create/page.tsx`:**
- Pola: code (slug), name, logo_url, display_order
- Walidacja: code unique, code lowercase + dashes only

**`/admin/vehicles/models/create/page.tsx`:**
- Pola: brand_id (Select z Brand), code, name, display_order
- Walidacja: code unique per brand

**`/admin/vehicles/generations/create/page.tsx`:**
- Pola: model_id (Select kaskadowy: najpierw Brand → potem Model), code, name, year_from, year_to (nullable), body_type (TextAutocomplete)
- Walidacja: code unique per model, year_from > 1900, year_to >= year_from (lub null)

**Strony [id] edycji** — analogiczne, pola pre-filled, plus przycisk "Usuń" z confirmation.

---

## 8. Komponent: `VehiclePicker`

**Lokalizacja:** `src/admin/components/vehicle-picker/index.tsx`

**Props:**
```ts
interface VehiclePickerProps {
  selectedGenerationIds: string[]
  onSelectionChange: (ids: string[]) => void
  showSelectAll?: boolean  // pokazuje przycisk "Zaznacz wszystkie auta"
}
```

**Behavior:**
- Kaskadowo: Brand → Model → Generation
- Multi-select na poziomie Generation (zaznaczasz kilka generacji jednocześnie)
- Wybrane generacje pokazują się jako tagi/chips u góry komponentu (z możliwością usunięcia)
- Search box: szukasz po nazwie generacji (`"octavia"` → pokazuje wszystkie generacje Octavii)
- Przycisk **"Zaznacz wszystkie auta"** (gdy `showSelectAll`) — wywołuje endpoint listujący wszystkie Generation ID i ustawia `selectedGenerationIds` na pełną listę

**Endpoint danych:**
`GET /store/vehicle-fitment/lookup` (z Fazy 1) zwraca płaską strukturę pojazdów.

**Użycie:**
- W formularzu edycji Hooka (panel "Pasujące pojazdy")
- W formularzu edycji StandaloneWiring (panel "Pasujące pojazdy", warunkowy)
- W `PublishProductModal` (wybór generacji do wystawienia produktu)

---

## 9. Komponent: `TextAutocomplete`

**Lokalizacja:** `src/admin/components/text-autocomplete/index.tsx`

**Props:**
```ts
interface TextAutocompleteProps {
  value: string
  onChange: (value: string) => void
  fetchSuggestions: (query: string) => Promise<string[]>
  placeholder?: string
  label?: string
  required?: boolean
}
```

**Behavior:**
- Input typu text z dropdownem sugestii
- Sugestie pobierane przez `fetchSuggestions(query)` — debounce 300ms
- Klik na sugestię → wypełnia input
- Można też wpisać nową wartość której nie ma na liście (jest to **autocomplete**, nie **select**)
- Sugestie z istniejących rekordów w bazie

**Endpointy pomocnicze (do dodania):**
```
GET /admin/autocomplete/manufacturers?q={query}  → unique manufacturer z Hook + BikeRack + SW
GET /admin/autocomplete/homologations?q={query}  → unique homologation z Hook + SW + WiringEquipment
GET /admin/autocomplete/ball-types?q={query}     → unique ball_type z Hook
GET /admin/autocomplete/body-types?q={query}     → unique body_type z Generation
```

Każdy endpoint zwraca tablicę unikalnych wartości matchujących query (case-insensitive substring).

---

## 10. Komponent: `PublishProductModal`

**Lokalizacja:** `src/admin/components/publish-product-modal/index.tsx`

**Props:**
```ts
interface PublishProductModalProps {
  open: boolean
  onClose: () => void
  category: "hook" | "bike-rack" | "standalone-wiring"
  catalogItem: Hook | BikeRack | StandaloneWiring
  onSuccess: (productIds: string[]) => void
}
```

**Behavior per kategoria:**

### 10.1. Modal dla Hooka

**Sekcje:**
1. Header: "Wystaw produkt: {hook.name}"
2. **Wybór generacji** — komponent `VehiclePicker` (multi-select)
3. **Ceny wariantów** (5 inputów):
   - Sam hak (BARE) — input number
   - Wiązka 7-Pin (W7) — input number
   - Wiązka 13-Pin (W13) — input number
   - Moduł 7-Pin (M7) — input number
   - Moduł 13-Pin (M13) — input number
4. **Stany magazynowe** (5 inputów, default 0)
5. **Status:** Radio button — Szkic / Opublikowany
6. Przyciski: Anuluj / Wystaw

**Submit:**
```ts
POST /admin/catalog/publish-hook
{
  hookId,
  generationIds,
  variantPrices: { BARE, W7, W13, M7, M13 },
  variantInventory: { BARE, W7, W13, M7, M13 },
  status: "draft" | "published"
}
```

Po sukcesie: toast "Wystawiono X produktów", `onSuccess(productIds)`, zamknij modal.

### 10.2. Modal dla BikeRacka

**Sekcje:**
1. Header
2. **Cena** (1 input)
3. **Stan magazynowy** (1 input)
4. **Status:** Radio
5. Przyciski

Brak sekcji generacji (bagażnik nie ma fitmentu).

**Submit:** `POST /admin/catalog/publish-bike-rack { bikeRackId, price, inventory, status }`

### 10.3. Modal dla StandaloneWiring

**Sekcje:**
1. Header
2. **Warunkowo:** Wybór generacji (`VehiclePicker`) — TYLKO jeśli `wiring.fits_all_vehicles = false`
3. **Cena** (1 input)
4. **Stan magazynowy** (1 input)
5. **Status:** Radio
6. Przyciski

**Submit:** `POST /admin/catalog/publish-standalone-wiring { wiringId, generationIds?, price, inventory, status }`

---

## 11. Widget: `product-hook-info` (na stronie Medusa Product)

**Lokalizacja:** `src/admin/widgets/product-hook-info.tsx`

**Zone:** `product.details.side.after` (widget pokazuje się w sidebarze strony szczegółów produktu)

**Behavior:**
- Sprawdza czy produkt ma link do Hook (przez Medusa Query)
- Jeśli tak: pokazuje kartę z:
  - Nr katalogowy haka
  - Nazwa
  - Producent
  - Kluczowe parametry (uciąg, nacisk, homologacja, ball_type)
  - Link "Edytuj hak →" do `/admin/hooks/:id`
- Jeśli nie: nie pokazuje się

Analogicznie zrób:
- `product-bike-rack-info.tsx` — dla produktów linkowanych do BikeRack
- `product-standalone-wiring-info.tsx` — dla SW

---

## 12. Widget: `product-fitment-info`

**Lokalizacja:** `src/admin/widgets/product-fitment-info.tsx`

**Zone:** `product.details.side.after`

**Behavior:**
- Pokazuje listę Generation do których produkt jest linkowany
- Format: "Skoda Octavia 3 (2013-2019)", po jednej na linijkę
- Jeśli produkt ma link do StandaloneWiring z `fits_all_vehicles = true` → pokazuje badge "Uniwersalny — pasuje do wszystkich aut"
- Jeśli produkt nie ma fitmentu (bagażnik) → pokazuje notatkę "Brak fitmentu do auta — produkt uniwersalny"

---

## 13. Widget: `catalog-publish-button`

**Lokalizacja:** `src/admin/widgets/catalog-publish-button.tsx`

**Zone:** **NIE w Medusa Product**, tylko w naszych custom UI Routes (Hook detail, BikeRack detail, SW detail). To nie jest widget Medusy, to jest komponent reusable.

Lub zrób to jako sekcję bezpośrednio w stronach edycji katalogów (`/admin/hooks/[id]/page.tsx` itd.) — wybór CC.

**Funkcjonalność:** przycisk "Wystaw produkt" → otwiera `PublishProductModal`.

---

## 14. Wariant produktu — odczyt `variant.metadata.wiring_equipment_id`

**Kluczowy quirk z Fazy 1** (raport §10.4):

`ProductVariant` nie ma natywnego linku do `WiringEquipment` w Medusa 2.15.2 (bug). Workaround: dane w `variant.metadata`:
```ts
variant.metadata = {
  wiring_equipment_id: "we_xxx",
  wiring_equipment_code: "M13"
}
```

**Konsekwencje dla admin UI:**

1. **Widget na stronie produktu (warianty)** — gdy admin oglada wariant haka, musi pokazać "Z modułem 13-Pin" z `variant.metadata.wiring_equipment_code`
2. **Listing wariantów na stronie produktu** — zamiast standardowego badge'a Medusa "Variant: M13", pokaż czytelny label "Sam hak" / "Wiązka 7-Pin" itd. na podstawie metadata
3. **NIE używaj** Medusa-native `variant.wiring_equipment` (link) — nie istnieje funkcjonalnie

Stwórz helper:
```ts
// src/admin/utils/variant-wiring.ts
export function getVariantWiringInfo(variant: ProductVariant): {
  equipmentId?: string
  equipmentCode?: string
  label: string  // "Sam hak" | "Wiązka 7-Pin" | "Moduł 13-Pin" itd.
}
```

I używaj go wszędzie gdzie admin renderuje informację o wariancie haka.

---

## 15. Walidacja Zod

**Lokalizacja:** `src/validators/`

Pliki:
- `hook.ts` — `createHookSchema`, `updateHookSchema`
- `bike-rack.ts` — analogicznie
- `standalone-wiring.ts` — analogicznie
- `wiring-equipment.ts` — tylko update schema (no create/delete)
- `vehicle-fitment.ts` — `createBrandSchema`, `createVehicleModelSchema`, `createGenerationSchema`
- `publish-product.ts` — schemas dla 3 endpointów publish

Każdy endpoint admin walidauje body przez odpowiedni schema. W razie błędu zwraca 400 z `error.issues` (Zod format).

---

## 16. Cleanup z Fazy 1

Zgodnie z raportem §11.8:

**Pliki do usunięcia:**
- `apps/medusa/src/api/admin/custom/route.ts` (templatkowy)
- `apps/medusa/src/api/store/custom/route.ts` (templatkowy)

---

## 17. Plan iteracji (dla pracy z CC sekcja-po-sekcji)

Brief ma 17 sekcji. Rozbij na **~15 iteracji** z CC:

| Iteracja | Co | Czas |
|---|---|---|
| 1 | Sekcja 2 — admin endpointy do triggera workflowów (3 endpointy + Zod schemas) | 1-2h |
| 2 | Sekcja 9 — `TextAutocomplete` + endpointy autocomplete (4 endpointy) | 2h |
| 3 | Sekcja 8 — `VehiclePicker` komponent | 2-3h |
| 4 | Sekcja 14 — helper `getVariantWiringInfo` + odczyt metadata wszędzie | 1h |
| 5 | Sekcja 10 — `PublishProductModal` (3 warianty) | 2-3h |
| 6 | Sekcja 3 — UI Route `/admin/hooks` (listing + create + edit) | 3-4h |
| 7 | Sekcja 4 — UI Route `/admin/bike-racks` | 2-3h |
| 8 | Sekcja 5 — UI Route `/admin/standalone-wiring` (z warunkową logiką fits_all_vehicles) | 2-3h |
| 9 | Sekcja 6 — UI Route `/admin/wiring-equipment` (edycja 4 rekordów) | 1-2h |
| 10 | Sekcja 7 — UI Route `/admin/vehicles` (drzewo Brand/Model/Generation) | 3-4h |
| 11 | Sekcje 11-13 — widgety na stronach Medusa Product | 2h |
| 12 | Sekcja 15 — uzupełnienie walidacji Zod we wszystkich endpointach | 1h |
| 13 | Sekcja 16 — cleanup templatkowych endpointów | 15 min |
| 14 | Testy ręczne — wystawienie 5 produktów (3 haki + 1 bagażnik + 1 wiązka) przez UI | 1-2h |
| 15 | Raport końcowy Fazy 2 (`docs/raports/RAPORT-FAZA-2.md`) | 30 min |

**Razem: ~25-30h pracy z CC** rozłożone na 2-3 tygodnie.

**Kamień milowy Fazy 2:** wystawiasz 5 produktów (3 kategorie) wyłącznie przez UI panelu, bez tykania API. Średnio 30 sekund na produkt.

---

## 18. Co NIE wchodzi w ten brief

- Upload plików (obrazki, PDF) — w MVP wpisujemy URL-e. Uploader w V1.
- Rich Text Editor dla `description_html` — wystarczy Textarea na start. Pełny editor (np. TipTap) w V1.
- Multi-language UI — tylko polski.
- Permissions / role admin — wszyscy admini mają pełen dostęp.
- Bulk operations (masowe wystawianie, masowy import CSV) — V1.
- History / audit log zmian katalogu — V1.
- Notyfikacje o niskich stanach magazynowych — V1.
- Komenta i feedback wewnętrzny — V1.

---

## 19. Walidacja zgodności z guidelines

Przy każdej iteracji CC ma sprawdzić zgodność z `tech-stack-guidelines.md`:

- **Sekcja 3** (nazewnictwo): kebab-case pliki, PascalCase komponenty
- **Sekcja 4** (TypeScript strict): zero `any`, typowane wszystko
- **Sekcja 5** (architektura): logika w serwisach, walidacja w endpoincie
- **Sekcja 6** (error handling): MedusaError types
- **Sekcja 7** (walidacja Zod): jedno źródło prawdy typ+walidacja
- **Sekcja 8** (komentarze): JSDoc dla publicznych, brak "co robi"
- **Sekcja 9** (git): commity per iteracja, format `[FAZA-2] opis`
- **Sekcja 26** (quirks Medusy 2.15.2): pamiętaj o workaroundach

---

**Wersja briefu:** 1.0  
**Stan:** Gotowy do iteracyjnej implementacji z Claude Code  
**Zależności:** brief #1 (Faza 1) zakończony i działający + `zahakowani-raport-faza-1.md` + `zahakowani-tech-stack-guidelines.md` v1.3
