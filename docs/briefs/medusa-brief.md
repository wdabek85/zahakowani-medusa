# Brief #1: backend Medusa v2 — zahakowani (v2.0)

Sklep z akcesoriami motoryzacyjnymi. **3 kategorie produktowe od dnia 1**, architektura przygotowana na kolejne. Zbuduj custom moduły, linki, workflowy, endpointy i indexy opisane niżej. Medusa v2.

---

## Spis modułów

| Moduł | Lokalizacja | Rola |
|---|---|---|
| `hook_catalog` | `src/modules/hook-catalog/` | Katalog haków holowniczych (kategoria 1) |
| `wiring_equipment` | `src/modules/wiring-equipment/` | 4 reużywane rekordy okablowania jako warianty haka |
| `bike_rack_catalog` | `src/modules/bike-rack-catalog/` | Katalog bagażników rowerowych (kategoria 2) |
| `standalone_wiring_catalog` | `src/modules/standalone-wiring-catalog/` | Katalog wiązek/modułów sprzedawanych osobno (kategoria 3) |
| `vehicle_fitment` | `src/modules/vehicle-fitment/` | Drzewo pojazdów — wspólne dla wszystkich kategorii |
| `shared_utils` | `src/utils/catalog/` | Helpery (generator tytułu, SKU, handle) używane przez wszystkie workflowy |

---

## 1. Moduł: `vehicle_fitment` (wspólny)

Drzewo pojazdów używane przez wszystkie kategorie które mają fitment do auta.

### Brand

| Pole | Typ | Wymagane | Uwagi |
|---|---|---|---|
| `id` | id | auto | |
| `code` | text, unique | tak | slug: `skoda`, `ford`, `opel` |
| `name` | text | tak | `Skoda`, `Ford`, `Opel` |
| `logo_url` | text | nie | |
| `display_order` | number | tak | default `0` |

### VehicleModel

| Pole | Typ | Wymagane | Uwagi |
|---|---|---|---|
| `id` | id | auto | |
| `brand_id` | → Brand | tak | |
| `code` | text | tak | slug: `octavia`, `kuga` (unique per brand) |
| `name` | text | tak | `Octavia`, `Kuga` |
| `display_order` | number | tak | default `0` |

### Generation

| Pole | Typ | Wymagane | Uwagi |
|---|---|---|---|
| `id` | id | auto | |
| `model_id` | → VehicleModel | tak | |
| `code` | text | tak | slug: `octavia-3`, `kuga-2` (unique per model) |
| `name` | text | tak | `Octavia 3`, `Kuga 2` |
| `year_from` | number | tak | `2013` |
| `year_to` | number | nie | `2019`; `null` = ciągle produkowany |
| `body_type` | text | nie | `Kombi`, `Sedan`, `SUV`, `Hatchback` (autocomplete) |

### Pola wyliczane (helpery w serwisie)

```
generation.years_label  = year_to ? `${year_from}-${year_to}` : `${year_from}-obecnie`
generation.full_name    = `${brand.name} ${model.name} ${name} ${years_label}`
generation.url_slug     = `${brand.code}/${model.code}/${code}-${years_label}`
```

---

## 2. Moduł: `hook_catalog` (kategoria 1)

**Model:** `Hook` (katalog haka — master record, jedna sztuka per model haka).
Z jednego Hooka powstaje wiele Productów (jeden per generacja auta do której pasuje).

| Pole | Typ | Wymagane | Uwagi |
|---|---|---|---|
| `id` | id | auto | |
| `catalog_number` | text, unique | tak | wewnętrzny nr, np. `Z/016`, `E/051` |
| `name` | text | tak | nazwa wewnętrzna |
| `manufacturer` | text | tak | autocomplete w UI z istniejących wartości |
| `manufacturer_catalog_number` | text | nie | nr producenta jeśli inny |
| `pulling_capacity_kg` | number | tak | uciąg |
| `vertical_load_kg` | number | tak | nacisk na kulę |
| `homologation` | text | tak | np. `E20`, `E11` (autocomplete) |
| `ball_type` | text | tak | np. `Odkręcana`, `Stała`, `Automatyczna` (autocomplete) |
| `requires_bumper_cutting` | boolean | tak | default `false` |
| `warranty_years` | number | tak | default `2` |
| `weight_kg` | number | tak | waga samego haka |
| `description_html` | text | tak | główny opis, używany przez wszystkie produkty/warianty |
| `short_description` | text | nie | |
| `thumbnail` | text | tak | URL głównego obrazka |
| `gallery` | json | tak | tablica URL-i zdjęć samego haka |
| `installation_manual_url` | text | nie | URL do PDF instrukcji |
| `certificate_url` | text | nie | URL do PDF certyfikatu |
| `created_at` / `updated_at` | timestamp | auto | |

**Cena nie istnieje na poziomie Hooka.** Cena żyje tylko na `ProductVariant`, wpisywana ręcznie per wariant przy wystawianiu produktu.

---

## 3. Moduł: `wiring_equipment` (wsparcie kategorii 1)

4 reużywane rekordy używane jako warianty haka. **To nie jest kategoria produktowa.** To referencyjne dane do których linkują warianty produktów kategorii 1.

| Pole | Typ | Wymagane | Uwagi |
|---|---|---|---|
| `id` | id | auto | |
| `code` | text, unique | tak | `W7`, `W13`, `M7`, `M13` |
| `type` | enum | tak | `harness`, `module` |
| `pin_count` | enum | tak | `7`, `13` |
| `name` | text | tak | np. `Wiązka 13-Pin`, `Moduł 13-Pin` |
| `weight_kg` | number | tak | waga samego elementu |
| `description_html` | text | tak | wspólna specyfikacja modułu wyświetlana na karcie produktu |
| `has_fog_lights` | boolean | tak | |
| `has_reverse_lights` | boolean | tak | |
| `has_stop_lights` | boolean | tak | |
| `has_indicators` | boolean | tak | |
| `homologation` | text | tak | np. `E20` |
| `gallery` | json | tak | tablica URL-i (1-2 zdjęcia samego modułu/wiązki) |

**Seed (utworzyć migracją albo seederem):**

```
W7  { type: harness, pin_count: 7,  name: "Wiązka 7-Pin",  ... }
W13 { type: harness, pin_count: 13, name: "Wiązka 13-Pin", ... }
M7  { type: module,  pin_count: 7,  name: "Moduł 7-Pin",   ... }
M13 { type: module,  pin_count: 13, name: "Moduł 13-Pin",  ... }
```

**Konkretne wartości seed do migracji (TESTOWE — do podmiany przez admin po starcie):**

Wszystkie 4 rekordy mają identyczne wartości techniczne. To celowe — finalne dane podmieni admin przez panel po Fazie 2, gdy dostanie specyfikacje od producentów.

```
common_test_values = {
  weight_kg: 1.5,
  description_html: "<p>Wartości testowe - do uzupełnienia po Fazie 2.</p>",
  has_fog_lights: true,
  has_reverse_lights: true,
  has_stop_lights: true,
  has_indicators: true,
  homologation: "E20",
  gallery: []
}

W7  { code: "W7",  type: "harness", pin_count: 7,  name: "Wiązka 7-Pin",  ...common_test_values }
W13 { code: "W13", type: "harness", pin_count: 13, name: "Wiązka 13-Pin", ...common_test_values }
M7  { code: "M7",  type: "module",  pin_count: 7,  name: "Moduł 7-Pin",   ...common_test_values }
M13 { code: "M13", type: "module",  pin_count: 13, name: "Moduł 13-Pin",  ...common_test_values }
```

**Brak pola `price_delta`.** Ceny wariantów haków wpisywane ręcznie per produkt — nie ma automatycznego doliczania delty.

---

## 4. Moduł: `bike_rack_catalog` (kategoria 2)

**Model:** `BikeRack` (katalog bagażnika rowerowego).

| Pole | Typ | Wymagane | Uwagi |
|---|---|---|---|
| `id` | id | auto | |
| `catalog_number` | text, unique | tak | wewnętrzny nr |
| `name` | text | tak | nazwa wewnętrzna |
| `manufacturer` | text | tak | autocomplete |
| `max_bikes` | number | tak | maks. ilość rowerów |
| `max_bike_weight_kg` | number | tak | maks. waga jednego roweru |
| `max_total_load_kg` | number | tak | maks. ładowność całkowita |
| `power_socket` | enum | tak | `7-pin`, `13-pin` |
| `weight_kg` | number | tak | waga bagażnika |
| `length_cm` | number | tak | długość |
| `has_lockable_attachment` | boolean | tak | zamknięcie bagażnika na haku |
| `has_rear_lights` | boolean | tak | światła tylne |
| `has_tilt_function` | boolean | tak | funkcja odchylenia (dostęp do bagażnika) |
| `tool_free_assembly` | boolean | tak | montaż bez narzędzi |
| `warranty_years` | number | tak | default `2` |
| `description_html` | text | tak | |
| `short_description` | text | nie | |
| `thumbnail` | text | tak | |
| `gallery` | json | tak | |
| `installation_manual_url` | text | nie | |
| `created_at` / `updated_at` | timestamp | auto | |

**Brak linku do `vehicle_fitment` ani do Hooka.** Bagażnik to niezależny produkt — klient sam ocenia kompatybilność.

**Brak wariantów.** Z jednego `BikeRack` powstaje jeden `Product` z jednym `ProductVariant`.

---

## 5. Moduł: `standalone_wiring_catalog` (kategoria 3)

**Model:** `StandaloneWiring` (katalog wiązki/modułu sprzedawanego samodzielnie). Niezależny od `wiring_equipment` z kategorii 1.

| Pole | Typ | Wymagane | Uwagi |
|---|---|---|---|
| `id` | id | auto | |
| `catalog_number` | text, unique | tak | |
| `name` | text | tak | |
| `manufacturer` | text | tak | autocomplete |
| `type` | enum | tak | `harness`, `module` |
| `pin_count` | enum | tak | `7`, `13` |
| `weight_kg` | number | tak | |
| `has_fog_lights` | boolean | tak | |
| `has_reverse_lights` | boolean | tak | |
| `has_stop_lights` | boolean | tak | |
| `has_indicators` | boolean | tak | |
| `homologation` | text | tak | |
| `warranty_years` | number | tak | default `2` |
| `fits_all_vehicles` | boolean | tak | **kluczowa flaga**: jeśli `true`, produkt pasuje do każdego auta i nie wymaga linków do `Generation` |
| `description_html` | text | tak | |
| `short_description` | text | nie | |
| `thumbnail` | text | tak | |
| `gallery` | json | tak | |
| `installation_manual_url` | text | nie | |
| `created_at` / `updated_at` | timestamp | auto | |

**Brak wariantów.** Z jednego `StandaloneWiring` powstaje jeden `Product` z jednym `ProductVariant`.

**Link do `vehicle_fitment`:** opcjonalny.
- Jeśli `fits_all_vehicles = true` — pomijamy linki do `Generation`, produkt jest globalnie dostępny.
- Jeśli `fits_all_vehicles = false` — produkt jest linkowany do konkretnych `Generation`.

---

## 6. Module Links

**Lokalizacja:** `src/links/`

| Link | Kierunek | Plik | Uwagi |
|---|---|---|---|
| `Product ↔ Hook` | M:1 | `product-hook.ts` | dla produktów kategorii 1 |
| `Product ↔ BikeRack` | M:1 | `product-bike-rack.ts` | dla produktów kategorii 2 |
| `Product ↔ StandaloneWiring` | M:1 | `product-standalone-wiring.ts` | dla produktów kategorii 3 |
| `Product ↔ Generation` | M:N | `product-generation.ts` | wspólny dla kategorii 1 i 3 (kategoria 2 bez fitmentu) |
| `ProductVariant ↔ WiringEquipment` | M:1, **nullable** | `variant-wiring-equipment.ts` | wariant BARE haka nie ma linku |

---

## 7. Struktura wariantów per kategoria

### Kategoria 1 (haki) — 5 wariantów

Każdy Product ma jedną opcję `Konfiguracja` z 5 wartościami:

| Wariant | code | Link do WiringEquipment |
|---|---|---|
| Sam hak | BARE | — (null) |
| Wiązka 7-Pin | W7 | wiązka 7-pin |
| Wiązka 13-Pin | W13 | wiązka 13-pin |
| Moduł 7-Pin | M7 | moduł 7-pin |
| Moduł 13-Pin | M13 | moduł 13-pin |

**Każdy wariant ma własny unikalny SKU, własną cenę (wpisywaną ręcznie), własny stan magazynowy.** To jest wymóg dla Google Merchant Center i pracy operacyjnej.

### Kategoria 2 (bagażniki) — 1 wariant

Brak opcji wariantowych. Jeden Product = jeden Variant = jedno SKU.

### Kategoria 3 (wiązki standalone) — 1 wariant

Brak opcji wariantowych. Jeden Product = jeden Variant = jedno SKU.

---

## 8. Shared utilities (helpery)

**Lokalizacja:** `src/utils/catalog/`

Reużywane przez wszystkie workflowy. Każda funkcja przyjmuje kategorię + dane wejściowe.

### `generateProductTitle(params)`

Generuje tytuł produktu wg szablonu zależnego od kategorii.

```typescript
generateProductTitle({
  category: "hook" | "bike_rack" | "standalone_wiring",
  catalog: Hook | BikeRack | StandaloneWiring,
  generation?: Generation,  // opcjonalne dla kategorii 2 (brak fitmentu)
})
```

**Szablony:**

```
hook:
  "Hak holowniczy {brand.name} {model.name} {generation.name} {generation.years_label} {catalog.pulling_capacity_kg}kg {catalog.catalog_number}"

bike_rack:
  "{catalog.manufacturer} {catalog.name} - bagażnik rowerowy na hak {catalog.max_bikes} rowery {catalog.catalog_number}"

standalone_wiring:
  jeśli fits_all_vehicles:
    "{catalog.manufacturer} {catalog.name} {type_label} {pin_count}-Pin uniwersalny {catalog.catalog_number}"
  jeśli per generacja:
    "{catalog.manufacturer} {catalog.name} {type_label} {pin_count}-Pin {brand.name} {model.name} {generation.years_label} {catalog.catalog_number}"
```

### `generateProductVariantTitle(params)`

Tylko dla kategorii 1. Dla kategorii 2 i 3 wariant ma tytuł = tytuł produktu.

```
hook variant:
  "Hak holowniczy{variant_suffix} {brand.name} {model.name} {generation.name} {generation.years_label} {catalog.pulling_capacity_kg}kg {catalog.catalog_number}"

variant_suffix per code:
  BARE  → ""
  W7    → " + Wiązka 7-Pin"
  W13   → " + Wiązka 13-Pin"
  M7    → " + Moduł 7-Pin"
  M13   → " + Moduł 13-Pin"
```

### `generateSKU(params)`

Każdy wariant ma własny unikalny SKU.

```
hook variant:
  "{catalog.catalog_number}-{wiring.code or 'BARE'}"
  → "Z/016-M13", "Z/016-BARE"

bike_rack:
  "{catalog.catalog_number}"
  → "BR-2024-01"

standalone_wiring:
  "{catalog.catalog_number}"
  → "MOD-13-UNI-01"
```

### `generateProductHandle(title)`

Slug z tytułu produktu — używany w URL-ach. Standardowa konwersja Polish → ASCII + lowercase + dashes.

---

## 9. Workflowy

### `createProductFromHook`

**Lokalizacja:** `src/workflows/create-product-from-hook.ts`

**Input:**
```ts
{
  hookId: string
  generationIds: string[]
  variantPrices: {
    BARE: number
    W7: number
    W13: number
    M7: number
    M13: number
  }
  variantInventory?: {
    BARE: number
    W7: number
    W13: number
    M7: number
    M13: number
  }
  status?: "draft" | "published"
}
```

**Kroki (per Generation):**
1. Załaduj Hook, Generation (+ Brand, VehicleModel), wszystkie 4 WiringEquipment
2. Stwórz Product:
   - `title` z `generateProductTitle({ category: "hook", catalog: hook, generation })`
   - `handle` z `generateProductHandle(title)`
   - `description` ← `hook.description_html`
   - `thumbnail` ← `hook.thumbnail`
   - `status` ← input
   - jedna ProductOption `Konfiguracja` z 5 wartościami
3. Dla każdego z 5 wariantów:
   - `title` z `generateProductVariantTitle(...)`
   - `sku` z `generateSKU(...)`
   - `price` ← `input.variantPrices[code]`
   - `weight` ← `hook.weight_kg + (wiring?.weight_kg ?? 0)`
   - `inventory_quantity` ← `input.variantInventory?.[code] ?? 0`
4. Linki:
   - `Product → Hook`
   - `Product → Generation`
   - dla wariantów ≠ BARE: `ProductVariant → WiringEquipment`

### `createProductFromBikeRack`

**Lokalizacja:** `src/workflows/create-product-from-bike-rack.ts`

**Input:**
```ts
{
  bikeRackId: string
  price: number
  inventory?: number
  status?: "draft" | "published"
}
```

**Kroki:**
1. Załaduj BikeRack
2. Stwórz Product:
   - `title` z `generateProductTitle({ category: "bike_rack", catalog: bikeRack })`
   - `handle`, `description`, `thumbnail` analogicznie
   - bez ProductOption (jeden wariant)
3. Stwórz jeden ProductVariant:
   - `title` ← tytuł produktu
   - `sku` z `generateSKU({ category: "bike_rack", catalog: bikeRack })`
   - `price`, `weight`, `inventory_quantity` z inputu / BikeRack.weight_kg
4. Link: `Product → BikeRack`

### `createProductFromStandaloneWiring`

**Lokalizacja:** `src/workflows/create-product-from-standalone-wiring.ts`

**Input:**
```ts
{
  wiringId: string
  generationIds?: string[]   // wymagane jeśli fits_all_vehicles = false
  price: number
  inventory?: number
  status?: "draft" | "published"
}
```

**Logika:**
- Jeśli `wiring.fits_all_vehicles = true` → tworzymy 1 Product (uniwersalny), bez linków do Generation
- Jeśli `wiring.fits_all_vehicles = false` → tworzymy N Productów (po jednym per Generation), każdy z linkiem do swojej Generation

**Kroki (per generacja lub raz dla uniwersalnego):**
1. Załaduj StandaloneWiring, Generation (jeśli dotyczy)
2. Stwórz Product z odpowiednim tytułem (z szablonu)
3. Stwórz jeden ProductVariant
4. Linki: `Product → StandaloneWiring`, opcjonalnie `Product → Generation`

---

## 10. API Endpoints (store)

### Vehicle fitment

```
GET /store/vehicle-fitment/brands
  → lista wszystkich Brand z liczbą produktów
  Response: [{ id, code, name, logo_url, product_count }]

GET /store/vehicle-fitment/brands/:brandCode/models
  → modele dla marki z liczbą produktów per model

GET /store/vehicle-fitment/models/:modelCode/generations
  → generacje dla modelu (per brand+model) z liczbą produktów per generacja

GET /store/vehicle-fitment/lookup
  → płaska struktura {brand, model, generation} do selektora pojazdu na froncie
  Optymalizacja: jeden request zwraca wszystko do zbudowania kaskadowego dropdownu
```

### Cross-category vehicle search

```
GET /store/products/by-vehicle/:generationId
  → produkty wszystkich kategorii pasujące do danej generacji
  Response: {
    hooks: Product[],           // produkty kategorii 1 z linkiem do tej generacji
    standalone_wiring: Product[], // produkty kategorii 3: linkowane + fits_all_vehicles
    bike_racks: Product[]       // wszystkie produkty kategorii 2 (zawsze uniwersalne)
  }

  Query params:
    ?limit, ?offset (paginacja per kategoria)
```

### Listing per kategoria (z filtrami)

```
GET /store/categories/hooks/products
  Query params:
    ?brand_code=skoda
    ?generation_id=xxx
    ?pulling_capacity_min=1500
    ?pulling_capacity_max=2500
    ?ball_type=detachable
    ?homologation=E20
    ?manufacturer=imiola
    ?limit, ?offset, ?sort_by

GET /store/categories/bike-racks/products
  Query params:
    ?max_bikes=3
    ?has_tilt_function=true
    ?max_total_load_min=45

GET /store/categories/standalone-wiring/products
  Query params:
    ?type=module
    ?pin_count=13
    ?generation_id=xxx (lub fits_all_vehicles)
```

### SEO landing pages

```
GET /store/landing/:brandCode
  → dane dla strony /haki/skoda (cała oferta marki)

GET /store/landing/:brandCode/:modelCode
  → dane dla /haki/skoda/octavia

GET /store/landing/:brandCode/:modelCode/:generationCode
  → dane dla /haki/skoda/octavia/octavia-3-2013-2019 (cross-category)
```

---

## 11. Indexy w Postgres

Wszystkie krytyczne dla performance wyszukiwarki i filtrów. Generować w migracjach.

**Tabela linków `product_generation_link`:**
- Index na `generation_id` (wyszukiwarka po pojeździe)
- Index na `product_id` (odwrotny lookup)

**`standalone_wiring_catalog`:**
- Index na `fits_all_vehicles` (filtrowanie uniwersalnych)
- Index na `(type, pin_count)` (filtry kategorii)
- Index na `manufacturer`

**`hook_catalog`:**
- Index na `catalog_number` (unique constraint już to zapewnia)
- Index na `manufacturer`
- Index na `pulling_capacity_kg` (filtr zakresowy)
- Index na `ball_type`

**`bike_rack_catalog`:**
- Index na `catalog_number`
- Index na `manufacturer`
- Index na `max_bikes`

**`vehicle_fitment` (Brand, VehicleModel, Generation):**
- Index na `Brand.code`
- Index na `(VehicleModel.brand_id, VehicleModel.code)` — composite
- Index na `(Generation.model_id, Generation.code)` — composite

---

## 12. Custom metadata dla ProductVariant

Wykorzystaj natywne `metadata` (jsonb) ProductVariant:

| Klucz | Typ | Sens |
|---|---|---|
| `description_addendum` | string | doklejany pod `description` produktu na froncie (tylko dla kategorii 1, opcjonalny override per wariant) |
| `gallery_override` | string[] | jeśli ustawiony, użyj zamiast wyliczanej galerii (kategoria 1) |

Domyślnie puste. Wypełniane sporadycznie przez admina.

---

## 13. Pola wyliczane na froncie (NIE w bazie)

### Badge na karcie produktu (kategoria 1)

```
zawsze:                ["Zestaw"]
jeśli wariant ma WiringEquipment:
  dodaj `${type_label} ${pin_label}` → "Moduł 13-Pin"
```

### "Moduł w zestawie" w tabeli specyfikacji (kategoria 1)

```
brak WiringEquipment: "Nie"
ma WiringEquipment:   `Tak, ${type_label} ${pin_label}`
```

### Galeria wariantu (kategoria 1)

```
gallery_override (metadata) jeśli ustawiony,
w przeciwnym razie:
  [...hook.gallery, ...(wiring?.gallery ?? [])]
  (dla BARE: tylko hook.gallery)
```

### Opis na stronie produktu (kategoria 1)

```
hook.description_html
+ jeśli variant.metadata.description_addendum: separator + addendum
```

---

## 15. Seed testowych danych (Faza 1)

CC dorzuca te seedy w migracji żeby od razu można było odpalić workflowy bez ręcznego klepania danych do bazy.

### Brand + VehicleModel + Generation

```
Brand: {
  code: "skoda",
  name: "Skoda",
  display_order: 0
}

VehicleModel: {
  brand_id: → skoda,
  code: "octavia",
  name: "Octavia",
  display_order: 0
}

Generation: {
  model_id: → octavia,
  code: "octavia-3",
  name: "Octavia 3",
  year_from: 2013,
  year_to: 2019,
  body_type: "Kombi"
}
```

### Hook (kategoria 1)

```
{
  catalog_number: "Z/016",
  name: "Hak Skoda Octavia 3 testowy",
  manufacturer: "Imioła Hak-Pol",
  manufacturer_catalog_number: null,
  pulling_capacity_kg: 1800,
  vertical_load_kg: 98,
  homologation: "E20",
  ball_type: "Odkręcana",
  requires_bumper_cutting: false,
  warranty_years: 2,
  weight_kg: 10,
  description_html: "<p>Hak testowy - dane do uzupełnienia.</p>",
  short_description: null,
  thumbnail: "",
  gallery: [],
  installation_manual_url: null,
  certificate_url: null
}
```

### BikeRack (kategoria 2)

```
{
  catalog_number: "BR-TEST-01",
  name: "Bagażnik testowy",
  manufacturer: "Producent Testowy",
  max_bikes: 3,
  max_bike_weight_kg: 15,
  max_total_load_kg: 45,
  power_socket: "13-pin",
  weight_kg: 17,
  length_cm: 108,
  has_lockable_attachment: true,
  has_rear_lights: true,
  has_tilt_function: true,
  tool_free_assembly: true,
  warranty_years: 2,
  description_html: "<p>Bagażnik testowy - dane do uzupełnienia.</p>",
  short_description: null,
  thumbnail: "",
  gallery: [],
  installation_manual_url: null
}
```

### StandaloneWiring (kategoria 3)

```
{
  catalog_number: "SW-TEST-01",
  name: "Moduł 13-Pin uniwersalny testowy",
  manufacturer: "Producent Testowy",
  type: "module",
  pin_count: 13,
  weight_kg: 1.5,
  has_fog_lights: true,
  has_reverse_lights: true,
  has_stop_lights: true,
  has_indicators: true,
  homologation: "E20",
  warranty_years: 2,
  fits_all_vehicles: true,
  description_html: "<p>Moduł testowy uniwersalny - dane do uzupełnienia.</p>",
  short_description: null,
  thumbnail: "",
  gallery: [],
  installation_manual_url: null
}
```

---

## 16. Skrypt testowy

**Lokalizacja:** `src/scripts/test-workflows.ts`

Wywołanie: `npx medusa exec ./src/scripts/test-workflows.ts`

Skrypt odpala 3 workflowy z hardkodowanymi danymi (referencjami do seedów wyżej) i loguje rezultat. Pozwala zwalidować że schema, linki i workflowy działają end-to-end bez admin UI.

**Logika:**

```typescript
// 1. Hook → workflow createProductFromHook
//    hookId: znaleziony przez catalog_number "Z/016"
//    generationIds: [znaleziona generacja "octavia-3"]
//    variantPrices: { BARE: 420, W7: 480, W13: 530, M7: 580, M13: 700 }
//    variantInventory: { BARE: 5, W7: 5, W13: 5, M7: 5, M13: 5 }
//    status: "draft"
//
// Output: 1 Product (Hak holowniczy Skoda Octavia 3 2013-2019 1800kg Z/016) z 5 wariantami

// 2. BikeRack → workflow createProductFromBikeRack
//    bikeRackId: znaleziony przez "BR-TEST-01"
//    price: 1200
//    inventory: 3
//    status: "draft"
//
// Output: 1 Product (Producent Testowy Bagażnik testowy ...) z 1 wariantem

// 3. StandaloneWiring → workflow createProductFromStandaloneWiring
//    wiringId: znaleziony przez "SW-TEST-01"
//    generationIds: pomijamy (fits_all_vehicles = true)
//    price: 350
//    inventory: 10
//    status: "draft"
//
// Output: 1 Product uniwersalny z 1 wariantem

// Po każdym workflow loguj:
//   - product.id, product.title, product.handle
//   - liczbę wariantów, ich SKU i ceny
//   - powiązane Hook/BikeRack/StandaloneWiring
//   - powiązane Generation (lub fits_all_vehicles)
```

Po wykonaniu skryptu user wchodzi do `/app` (natywny admin Medusy), w sekcji Products widzi 3 produkty, klika na hak żeby zobaczyć 5 wariantów.

---

## 17. Co NIE wchodzi w ten brief (osobne tematy)

- Admin UI Routes (`/admin/...`) — brief #2
- Widgety na stronach Medusa Product w admin — brief #2
- Frontend Next.js — brief #3
- Filtrowanie i sortowanie szczegółowe (algorytm rankingu) — V1
- Omnibus / historia cen — osobny moduł, dorzucenie przed launchem
- Eksport feedu Google Merchant Center — V1
- Seedy danych pojazdów (Brand/Model/Generation) — zrobić osobnym skryptem po implementacji
- Recenzje, wishlist, stock alerts — V1

---

**Wersja briefu:** 2.1  
**Co zmienione vs v2.0:**
- Dodany seed testowych danych dla wszystkich kategorii (Brand, VehicleModel, Generation, Hook, BikeRack, StandaloneWiring + 4 WiringEquipment już były)
- Dodany skrypt testowy `src/scripts/test-workflows.ts` odpalający 3 workflowy z hardkodowanymi danymi

**Co zmienione vs v1.0:**
- Cena per wariant ręczna (usunięto `Hook.base_price`, `WiringEquipment.price_delta`)
- Każdy wariant ma własny unikalny SKU — explicite w sekcji 7
- Dodany moduł `bike_rack_catalog` (kategoria 2)
- Dodany moduł `standalone_wiring_catalog` z flagą `fits_all_vehicles` (kategoria 3)
- Helpery wyciągnięte do `shared_utils` pod multi-category
- Dodane endpointy cross-category vehicle search + SEO landing pages
- Dodana sekcja indexów Postgres
- Dodany workflow `createProductFromBikeRack` i `createProductFromStandaloneWiring`
