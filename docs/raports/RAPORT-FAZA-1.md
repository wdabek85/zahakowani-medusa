# Raport z Fazy 1 — Backend Medusy

**Repo:** https://github.com/wdabek85/zahakowani-medusa
**Stack:** Medusa.js v2.15.2 + PostgreSQL 16 + Redis 7 + TypeScript strict
**Data:** 2026-05-16
**Status:** Faza 1 zakończona — `test-workflows.ts` tworzy 3 produkty (5+1+1 wariantów), wszystkie widoczne w `/app/products`.

---

## 1. Struktura katalogów `src/`

```
src/
├── admin/
│   ├── i18n/
│   │   ├── index.ts
│   │   └── README.md
│   ├── README.md
│   ├── tsconfig.json
│   └── vite-env.d.ts
├── api/
│   ├── admin/
│   │   └── custom/
│   │       └── route.ts
│   ├── README.md
│   └── store/
│       ├── categories/
│       │   ├── bike-racks/products/route.ts
│       │   ├── hooks/products/route.ts
│       │   └── standalone-wiring/products/route.ts
│       ├── custom/route.ts
│       ├── landing/
│       │   └── [brandCode]/
│       │       ├── route.ts
│       │       └── [modelCode]/
│       │           ├── route.ts
│       │           └── [generationCode]/route.ts
│       ├── products/
│       │   └── by-vehicle/[generationId]/route.ts
│       └── vehicle-fitment/
│           ├── brands/
│           │   ├── route.ts
│           │   └── [brandCode]/models/route.ts
│           ├── lookup/route.ts
│           └── models/[modelId]/generations/route.ts
├── jobs/
│   └── README.md
├── links/
│   ├── README.md
│   ├── product-bike-rack.ts
│   ├── product-generation.ts
│   ├── product-hook.ts
│   ├── product-standalone-wiring.ts
│   └── variant-wiring-equipment.ts
├── migration-scripts/
│   ├── initial-data-seed.ts          ← z templatki Medusy (regions, sample products)
│   ├── seed-test-catalog-data.ts     ← seed naszych testowych danych (Brand/Hook/BikeRack/SW)
│   └── seed-wiring-equipment.ts      ← seed 4 rekordów WiringEquipment (W7/W13/M7/M13)
├── modules/
│   ├── bike-rack-catalog/
│   │   ├── index.ts
│   │   ├── migrations/Migration20260516094228.ts
│   │   ├── models/{bike-rack.ts, index.ts}
│   │   ├── README.md
│   │   └── service.ts
│   ├── hook-catalog/
│   │   ├── index.ts
│   │   ├── migrations/Migration20260516093604.ts
│   │   ├── models/{hook.ts, index.ts}
│   │   ├── README.md
│   │   └── service.ts
│   ├── standalone-wiring-catalog/
│   │   ├── index.ts
│   │   ├── migrations/Migration20260516094422.ts
│   │   ├── models/{standalone-wiring.ts, index.ts}
│   │   ├── README.md
│   │   └── service.ts
│   ├── vehicle-fitment/
│   │   ├── index.ts
│   │   ├── migrations/Migration20260516093331.ts
│   │   ├── models/{brand.ts, vehicle-model.ts, generation.ts, index.ts}
│   │   ├── README.md
│   │   └── service.ts
│   └── wiring-equipment/
│       ├── index.ts
│       ├── migrations/Migration20260516093952.ts
│       ├── models/{wiring-equipment.ts, index.ts}
│       ├── README.md
│       └── service.ts
├── scripts/
│   ├── test-bike-rack-catalog.ts
│   ├── test-catalog-utils.ts
│   ├── test-create-product-from-hook.ts
│   ├── test-hook-catalog.ts
│   ├── test-listing-landing-api.ts
│   ├── test-standalone-wiring-catalog.ts
│   ├── test-vehicle-fitment-api.ts
│   ├── test-vehicle-fitment.ts
│   ├── test-workflows-2.ts
│   └── test-workflows.ts              ← główny milestone Fazy 1
├── subscribers/
├── utils/
│   └── catalog/
│       ├── generate-product-handle.ts
│       ├── generate-product-title.ts
│       ├── generate-sku.ts
│       ├── generate-variant-title.ts
│       ├── index.ts
│       ├── types.ts
│       └── years-label.ts
└── workflows/
    ├── create-product-from-bike-rack.ts
    ├── create-product-from-hook.ts
    └── create-product-from-standalone-wiring.ts
```

---

## 2. Modele danych

### `src/modules/vehicle-fitment/models/brand.ts`

```typescript
import { model } from "@medusajs/framework/utils"
import { VehicleModel } from "./vehicle-model"

export const Brand = model.define("brand", {
  id: model.id().primaryKey(),
  code: model.text().unique(),
  name: model.text(),
  logo_url: model.text().nullable(),
  display_order: model.number().default(0),
  models: model.hasMany(() => VehicleModel),
})
```

### `src/modules/vehicle-fitment/models/vehicle-model.ts`

```typescript
import { model } from "@medusajs/framework/utils"
import { Brand } from "./brand"
import { Generation } from "./generation"

export const VehicleModel = model.define("vehicle_model", {
  id: model.id().primaryKey(),
  code: model.text(),
  name: model.text(),
  display_order: model.number().default(0),
  brand: model.belongsTo(() => Brand, { mappedBy: "models" }),
  generations: model.hasMany(() => Generation),
}).indexes([
  {
    on: ["brand_id", "code"],
    unique: true,
  },
])
```

### `src/modules/vehicle-fitment/models/generation.ts`

```typescript
import { model } from "@medusajs/framework/utils"
import { VehicleModel } from "./vehicle-model"

export const Generation = model.define("generation", {
  id: model.id().primaryKey(),
  code: model.text(),
  name: model.text(),
  year_from: model.number(),
  year_to: model.number().nullable(),
  body_type: model.text().nullable(),
  vehicle_model: model.belongsTo(() => VehicleModel, { mappedBy: "generations" }),
}).indexes([
  {
    on: ["vehicle_model_id", "code"],
    unique: true,
  },
])
```

### `src/modules/hook-catalog/models/hook.ts`

```typescript
import { model } from "@medusajs/framework/utils"

export const Hook = model.define("hook", {
  id: model.id().primaryKey(),
  catalog_number: model.text().unique(),
  name: model.text(),
  manufacturer: model.text(),
  manufacturer_catalog_number: model.text().nullable(),
  pulling_capacity_kg: model.number(),
  vertical_load_kg: model.number(),
  homologation: model.text(),
  ball_type: model.text(),
  requires_bumper_cutting: model.boolean().default(false),
  warranty_years: model.number().default(2),
  weight_kg: model.number(),
  description_html: model.text(),
  short_description: model.text().nullable(),
  thumbnail: model.text(),
  gallery: model.json(),
  installation_manual_url: model.text().nullable(),
  certificate_url: model.text().nullable(),
}).indexes([
  { on: ["manufacturer"] },
  { on: ["pulling_capacity_kg"] },
  { on: ["ball_type"] },
])
```

### `src/modules/wiring-equipment/models/wiring-equipment.ts`

```typescript
import { model } from "@medusajs/framework/utils"

export const WiringEquipment = model.define("wiring_equipment", {
  id: model.id().primaryKey(),
  code: model.text().unique(),
  type: model.enum(["harness", "module"]),
  pin_count: model.number(),
  name: model.text(),
  weight_kg: model.number(),
  description_html: model.text(),
  has_fog_lights: model.boolean(),
  has_reverse_lights: model.boolean(),
  has_stop_lights: model.boolean(),
  has_indicators: model.boolean(),
  homologation: model.text(),
  gallery: model.json(),
})
```

### `src/modules/bike-rack-catalog/models/bike-rack.ts`

```typescript
import { model } from "@medusajs/framework/utils"

export const BikeRack = model.define("bike_rack", {
  id: model.id().primaryKey(),
  catalog_number: model.text().unique(),
  name: model.text(),
  manufacturer: model.text(),
  max_bikes: model.number(),
  max_bike_weight_kg: model.number(),
  max_total_load_kg: model.number(),
  // GraphQL enum values must be valid identifiers (cannot start with digit or contain "-"),
  // so we store as text + validate allowed values ("7-pin" | "13-pin") at the API/Zod layer.
  power_socket: model.text(),
  weight_kg: model.number(),
  length_cm: model.number(),
  has_lockable_attachment: model.boolean(),
  has_rear_lights: model.boolean(),
  has_tilt_function: model.boolean(),
  tool_free_assembly: model.boolean(),
  warranty_years: model.number().default(2),
  description_html: model.text(),
  short_description: model.text().nullable(),
  thumbnail: model.text(),
  gallery: model.json(),
  installation_manual_url: model.text().nullable(),
}).indexes([
  { on: ["manufacturer"] },
  { on: ["max_bikes"] },
])
```

### `src/modules/standalone-wiring-catalog/models/standalone-wiring.ts`

```typescript
import { model } from "@medusajs/framework/utils"

export const StandaloneWiring = model.define("standalone_wiring", {
  id: model.id().primaryKey(),
  catalog_number: model.text().unique(),
  name: model.text(),
  manufacturer: model.text(),
  type: model.enum(["harness", "module"]),
  pin_count: model.number(),
  weight_kg: model.number(),
  has_fog_lights: model.boolean(),
  has_reverse_lights: model.boolean(),
  has_stop_lights: model.boolean(),
  has_indicators: model.boolean(),
  homologation: model.text(),
  warranty_years: model.number().default(2),
  fits_all_vehicles: model.boolean(),
  description_html: model.text(),
  short_description: model.text().nullable(),
  thumbnail: model.text(),
  gallery: model.json(),
  installation_manual_url: model.text().nullable(),
}).indexes([
  { on: ["fits_all_vehicles"] },
  { on: ["type", "pin_count"] },
  { on: ["manufacturer"] },
])
```

---

## 3. Module Links

### `src/links/product-hook.ts`

```typescript
import HookCatalogModule from "../modules/hook-catalog"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Product ↔ Hook (M:1, kategoria 1).
 *
 * One Hook (catalog master record) generates many Products — one per vehicle
 * generation it fits — via the `createProductFromHook` workflow.
 */
export default defineLink(
  ProductModule.linkable.product,
  HookCatalogModule.linkable.hook,
)
```

### `src/links/product-bike-rack.ts`

```typescript
import BikeRackCatalogModule from "../modules/bike-rack-catalog"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Product ↔ BikeRack (M:1, kategoria 2).
 *
 * One BikeRack generates one Product (no variant configurations, no vehicle
 * fitment) via the `createProductFromBikeRack` workflow.
 */
export default defineLink(
  ProductModule.linkable.product,
  BikeRackCatalogModule.linkable.bikeRack,
)
```

### `src/links/product-standalone-wiring.ts`

```typescript
import StandaloneWiringCatalogModule from "../modules/standalone-wiring-catalog"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Product ↔ StandaloneWiring (M:1, kategoria 3).
 *
 * One StandaloneWiring generates:
 *  - 1 Product if `fits_all_vehicles = true` (no Generation links)
 *  - N Products (one per generationId) if `fits_all_vehicles = false`
 *
 * Created via `createProductFromStandaloneWiring` workflow.
 */
export default defineLink(
  ProductModule.linkable.product,
  StandaloneWiringCatalogModule.linkable.standaloneWiring,
)
```

### `src/links/product-generation.ts`

```typescript
import VehicleFitmentModule from "../modules/vehicle-fitment"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Product ↔ Generation (M:N, shared by category 1 and category 3).
 *
 * One Product (hook or standalone-wiring with `fits_all_vehicles = false`)
 * fits one specific generation. From the other side, one Generation can have
 * many Products (different hook variants, different standalone wirings).
 *
 * Category 2 (bike racks) does NOT use this link — bike racks are universal.
 *
 * The auto-generated link table (`product_generation`) gets indexes on both
 * foreign keys, which powers the cross-category vehicle search endpoint
 * (`GET /store/products/by-vehicle/:generationId`, brief §10).
 */
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  {
    linkable: VehicleFitmentModule.linkable.generation,
    isList: true,
  },
)
```

### `src/links/variant-wiring-equipment.ts`

```typescript
import WiringEquipmentModule from "../modules/wiring-equipment"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * ProductVariant ↔ WiringEquipment (M:1, nullable, category 1 only).
 *
 * Hook products have 5 variants:
 *  - BARE (no wiring) → no link
 *  - W7, W13, M7, M13 → link to the matching WiringEquipment record
 *
 * Because Medusa stores links in a separate table, "nullable" is natural:
 * a variant without a link row simply has no associated WiringEquipment.
 */
export default defineLink(
  ProductModule.linkable.productVariant,
  WiringEquipmentModule.linkable.wiringEquipment,
)
```

**⚠️ Uwaga (Medusa 2.15.2):** Tabela linku istnieje i `defineLink` jest poprawny, ale `link.create({ [Modules.PRODUCT]: { product_variant_id }, [WIRING_EQUIPMENT_MODULE]: { wiring_equipment_id }})` rzuca `"Cannot create multiple links between 'product' and 'wiring_equipment'"` — Medusa nie rozróżnia Product vs ProductVariant pod tym samym service-name `product` przy multi-record batch. Workaround zaaplikowany w workflow `createProductFromHook`: `wiring_equipment_id` + `wiring_equipment_code` zapisywane w `variant.metadata`. Link gotowy do wpięcia gdy Medusa to naprawi.

---

## 4. Workflowy — sygnatury

### `src/workflows/create-product-from-hook.ts`

**Eksport:** `createProductFromHookWorkflow` (przez `createWorkflow("create-product-from-hook", ...)`)

**Input type:**
```typescript
export type CreateProductFromHookInput = {
  hookId: string
  generationIds: string[]
  variantPrices: Record<HookVariantCode, number>
  // HookVariantCode = "BARE" | "W7" | "W13" | "M7" | "M13"
  variantInventory?: Partial<Record<HookVariantCode, number>>
  status?: "draft" | "published"
  currencyCode?: string  // domyślnie "pln"
}
```

**Steps (w kolejności wykonania):**
1. `load-hook-context` (`loadHookContextStep`) — pobiera Hook, Generations z relacjami brand+model, wszystkie 4 WiringEquipment, default sales channel / stock location / shipping profile. Throws `MedusaError(NOT_FOUND)` / `UNEXPECTED_STATE` jeśli czegoś brak.
2. `create-products-as-step` — `createProductsWorkflow.runAsStep()` (Medusa core flow, z auto-rollback)
3. `build-link-inputs` (`buildLinkInputsStep`) — re-query variants po `product_id`, mapuje variant code z SKU na `wiring_equipment_id`, zwraca link inputs.
4. `create-product-links` (`createProductLinksStep`) — tworzy linki Product↔Hook i Product↔Generation. Wiring linki — patrz uwaga niżej. Ma `compensate` (`link.dismiss`).

**Opis:** Tworzy N Productów (po jednym per `generationId`), każdy z 5 wariantami (BARE/W7/W13/M7/M13) z ceną z inputu, SKU `{catalog_number}-{generation_code}-{variant_code}`, wagą `hook.weight_kg + wiring?.weight_kg`, opcją `Konfiguracja` z 5 wartościami. Linki Product↔Hook i Product↔Generation. Wiring → zapis na `variant.metadata.wiring_equipment_id/code` (workaround dla Medusy 2.15.2).

---

### `src/workflows/create-product-from-bike-rack.ts`

**Eksport:** `createProductFromBikeRackWorkflow` (`createWorkflow("create-product-from-bike-rack", ...)`)

**Input type:**
```typescript
export type CreateProductFromBikeRackInput = {
  bikeRackId: string
  price: number
  inventory?: number
  status?: "draft" | "published"
  currencyCode?: string  // domyślnie "pln"
}
```

**Steps:**
1. `load-bike-rack-context` (`loadBikeRackContextStep`) — pobiera BikeRack + default sales channel/shipping profile.
2. `create-products-as-step` — `createProductsWorkflow.runAsStep()`
3. `create-bike-rack-link` (`createBikeRackLinkStep`) — tworzy link Product↔BikeRack. `compensate` cofa.

**Opis:** Tworzy 1 Product z 1 wariantem z BikeRack. Bez fitmentu (bagażnik uniwersalny), bez wariantów konfiguracyjnych (Medusa wymaga przynajmniej jednej opcji — dodajemy `"Wariant": "Standardowy"`). SKU = `catalog_number`. Link tylko do BikeRack.

---

### `src/workflows/create-product-from-standalone-wiring.ts`

**Eksport:** `createProductFromStandaloneWiringWorkflow` (`createWorkflow("create-product-from-standalone-wiring", ...)`)

**Input type:**
```typescript
export type CreateProductFromStandaloneWiringInput = {
  wiringId: string
  generationIds?: string[]   // wymagane gdy fits_all_vehicles=false
  price: number
  inventory?: number
  status?: "draft" | "published"
  currencyCode?: string
}
```

**Steps:**
1. `load-standalone-wiring-context` (`loadStandaloneWiringContextStep`) — pobiera StandaloneWiring + walidacja: `fits_all_vehicles=true` + `generationIds` → rzuca `INVALID_DATA`; `fits_all_vehicles=false` + brak `generationIds` → rzuca `INVALID_DATA`. Generations doładowane gdy per-gen.
2. `create-products-as-step` — `createProductsWorkflow.runAsStep()`
3. `create-standalone-wiring-links` (`createStandaloneWiringLinksStep`) — tworzy linki Product↔StandaloneWiring (zawsze) + Product↔Generation (tylko per-gen). `compensate` cofa.

**Opis:** Rozgałęzienie na `fits_all_vehicles`:
- `true` → 1 Product (uniwersalny), bez linków do Generation, SKU = `catalog_number`
- `false` → N Productów (po jednym per `generationId`), każdy z linkiem M:N do swojej generacji, SKU = `{catalog_number}-{generation_code}`

---

## 5. Shared utilities (`src/utils/catalog/`)

```typescript
// types.ts
export type CatalogCategory = "hook" | "bike_rack" | "standalone_wiring"
export type HookVariantCode = "BARE" | "W7" | "W13" | "M7" | "M13"

export type GenerationInput = {
  name: string
  code: string
  year_from: number
  year_to: number | null
  vehicle_model: {
    name: string
    code: string
    brand: { name: string; code: string }
  }
}

export type HookInput = {
  catalog_number: string
  pulling_capacity_kg: number
}

export type BikeRackInput = {
  catalog_number: string
  name: string
  manufacturer: string
  max_bikes: number
}

export type StandaloneWiringInput = {
  catalog_number: string
  name: string
  manufacturer: string
  type: "harness" | "module"
  pin_count: number
  fits_all_vehicles: boolean
}
```

```typescript
// years-label.ts
export function getYearsLabel(yearFrom: number, yearTo: number | null): string
// "2013-2019" gdy yearTo, inaczej "2013-obecnie"
```

```typescript
// generate-product-title.ts
type GenerateProductTitleParams =
  | { category: "hook"; catalog: HookInput; generation: GenerationInput }
  | { category: "bike_rack"; catalog: BikeRackInput }
  | { category: "standalone_wiring"; catalog: StandaloneWiringInput; generation?: GenerationInput }

export function generateProductTitle(params: GenerateProductTitleParams): string
```

```typescript
// generate-variant-title.ts (tylko dla kategorii 1 — hook variants)
export function generateHookVariantTitle(params: {
  catalog: HookInput
  generation: GenerationInput
  variantCode: HookVariantCode
}): string
```

```typescript
// generate-sku.ts
type GenerateSkuParams =
  | { category: "hook"; catalogNumber: string; variantCode: HookVariantCode; generationCode: string }
  | { category: "bike_rack"; catalogNumber: string }
  | { category: "standalone_wiring"; catalogNumber: string; generationCode?: string }

export function generateSku(params: GenerateSkuParams): string
// hook: "{cat}-{generation_code}-{variant_code}" (np. "Z/016-octavia-3-M13")
// bike_rack / standalone_wiring (universal): "{cat}"
// standalone_wiring (per-gen): "{cat}-{generation_code}"
```

```typescript
// generate-product-handle.ts
export function generateProductHandle(title: string): string
// Polish diacritics → ASCII, lowercase, non-alphanumeric → "-", trim
```

---

## 6. API Endpointy

`find src/api -name "route.ts"`:

```
src/api/admin/custom/route.ts
src/api/store/categories/bike-racks/products/route.ts
src/api/store/categories/hooks/products/route.ts
src/api/store/categories/standalone-wiring/products/route.ts
src/api/store/custom/route.ts
src/api/store/landing/[brandCode]/[modelCode]/[generationCode]/route.ts
src/api/store/landing/[brandCode]/[modelCode]/route.ts
src/api/store/landing/[brandCode]/route.ts
src/api/store/products/by-vehicle/[generationId]/route.ts
src/api/store/vehicle-fitment/brands/[brandCode]/models/route.ts
src/api/store/vehicle-fitment/brands/route.ts
src/api/store/vehicle-fitment/lookup/route.ts
src/api/store/vehicle-fitment/models/[modelId]/generations/route.ts
```

**Lista endpointów (custom dodane w Fazie 1):**

- `GET /store/vehicle-fitment/brands` — lista marek z `product_count` (zliczone przez M:N product↔generation)
- `GET /store/vehicle-fitment/brands/:brandCode/models` — modele dla marki z `product_count` per model
- `GET /store/vehicle-fitment/models/:modelId/generations` — generacje dla modelu z `years_label` i `product_count`
- `GET /store/vehicle-fitment/lookup` — pełne drzewo brand→model→generation dla kaskadowego selektora pojazdu (jeden request)
- `GET /store/products/by-vehicle/:generationId` — cross-category vehicle search: zwraca `{ hooks, standalone_wiring, bike_racks, totals }` (hooks + per-gen SW + universal SW + wszystkie bike racks). Query: `?limit`, `?offset`.
- `GET /store/categories/hooks/products` — listing haków. Filtry: `?brand_code, ?generation_id, ?pulling_capacity_min, ?pulling_capacity_max, ?ball_type, ?homologation, ?manufacturer, ?limit, ?offset, ?sort_by`
- `GET /store/categories/bike-racks/products` — listing bagażników. Filtry: `?max_bikes, ?has_tilt_function, ?max_total_load_min, ?limit, ?offset, ?sort_by`
- `GET /store/categories/standalone-wiring/products` — listing wiązek. Filtry: `?type, ?pin_count, ?generation_id, ?fits_all_vehicles, ?limit, ?offset`
- `GET /store/landing/:brandCode` — SEO landing marki (np. `/haki/skoda`) — brand info, lista modeli/generacji, wszystkie produkty marki
- `GET /store/landing/:brandCode/:modelCode` — SEO landing modelu (np. `/haki/skoda/octavia`)
- `GET /store/landing/:brandCode/:modelCode/:generationCode` — SEO landing generacji (cross-category), zwraca `years_label`, `full_name`, `url_slug` + `{ hooks, standalone_wiring, bike_racks }` z `totals`

**Endpointy templatkowe Medusy (pozostawione bez zmian):**
- `GET /admin/custom/route.ts` — placeholder z `create-medusa-app`
- `GET /store/custom/route.ts` — placeholder z `create-medusa-app`

**Wszystkie `/store/*` wymagają header:**
```
x-publishable-api-key: pk_c1af8bc88b01b77c342f35f62974d63d97c4ef7eb064927ba0d3fb1098947c93
```

---

## 7. Seedy (dane w bazie po `npm run db:migrate`)

Counts (wszystkie z `deleted_at IS NULL`):

| Tabela | Count |
|---|---:|
| `brand` | 1 |
| `vehicle_model` | 1 |
| `generation` | 1 |
| `hook` | 1 |
| `bike_rack` | 1 |
| `standalone_wiring` | 1 |
| `wiring_equipment` | **4** |

### Pierwsze rekordy

**`brand`:**
```
id            | 01KRR54B5T9MNAKEP1FZ39M8JQ
code          | skoda
name          | Skoda
logo_url      | (null)
display_order | 0
```

**`vehicle_model`:**
```
id            | 01KRR54B619MCMETHC6Q15TBF8
code          | octavia
name          | Octavia
display_order | 0
brand_id      | 01KRR54B5T9MNAKEP1FZ39M8JQ
```

**`generation`:**
```
id               | 01KRR54B664GN97XJP3AKARMWC
code             | octavia-3
name             | Octavia 3
year_from        | 2013
year_to          | 2019
body_type        | Kombi
vehicle_model_id | 01KRR54B619MCMETHC6Q15TBF8
```

**`hook`:**
```
id                          | 01KRR54B6BRSXVBCJVHSVSYMV6
catalog_number              | Z/016
name                        | Hak Skoda Octavia 3 testowy
manufacturer                | Imioła Hak-Pol
manufacturer_catalog_number | (null)
pulling_capacity_kg         | 1800
vertical_load_kg            | 98
homologation                | E20
ball_type                   | Odkręcana
requires_bumper_cutting     | false
warranty_years              | 2
weight_kg                   | 10
description_html            | <p>Hak testowy - dane do uzupełnienia.</p>
short_description           | (null)
thumbnail                   | (empty)
gallery                     | []
installation_manual_url     | (null)
certificate_url             | (null)
```

**`bike_rack`:**
```
id                      | 01KRR54B6GJCMB0BPRC3EAN6ZP
catalog_number          | BR-TEST-01
name                    | Bagażnik testowy
manufacturer            | Producent Testowy
max_bikes               | 3
max_bike_weight_kg      | 15
max_total_load_kg       | 45
power_socket            | 13-pin
weight_kg               | 17
length_cm               | 108
has_lockable_attachment | true
has_rear_lights         | true
has_tilt_function       | true
tool_free_assembly      | true
warranty_years          | 2
description_html        | <p>Bagażnik testowy - dane do uzupełnienia.</p>
short_description       | (null)
thumbnail               | (empty)
gallery                 | []
installation_manual_url | (null)
```

**`standalone_wiring`:**
```
id                      | 01KRR54B6NHVKBGGTY47YFGCSW
catalog_number          | SW-TEST-01
name                    | Moduł 13-Pin uniwersalny testowy
manufacturer            | Producent Testowy
type                    | module
pin_count               | 13
weight_kg               | 2
has_fog_lights          | true
has_reverse_lights      | true
has_stop_lights         | true
has_indicators          | true
homologation            | E20
warranty_years          | 2
fits_all_vehicles       | true
description_html        | <p>Moduł testowy uniwersalny - dane do uzupełnienia.</p>
short_description       | (null)
thumbnail               | (empty)
gallery                 | []
installation_manual_url | (null)
```

**`wiring_equipment` (pierwszy z 4):**
```
id                 | 01KRR2H96REH14GB1HW2BQJ9EX
code               | W7
type               | harness
pin_count          | 7
name               | Wiązka 7-Pin
weight_kg          | 2
description_html   | <p>Wartości testowe — do uzupełnienia po Fazie 2.</p>
has_fog_lights     | true
has_reverse_lights | true
has_stop_lights    | true
has_indicators     | true
homologation       | E20
gallery            | []
```

Pozostałe 3 (`W13`, `M7`, `M13`) mają identyczne `common_test_values`, różnią się tylko `code` / `type` / `pin_count` / `name`.

**Uwaga o precyzji wagi:** Brief specyfikował `weight_kg: 1.5` dla wiringów. Medusa `model.number()` mapuje na PostgreSQL `integer`, więc zaokrąglono do `2`. Refactor na `model.bigNumber()` lub numeric column dopiero gdy precyzja decimal okaże się prod-critical.

---

## 8. Test skryptu `test-workflows.ts`

Wykonanie: `npx medusa exec ./src/scripts/test-workflows.ts`

```
info:    Executing script at ./src/scripts/test-workflows.ts...
info:    redisUrl not found. A fake redis instance will be used.
info:    No link to load from ...\@medusajs\draft-order\.medusa\server\src\links. skipped.
warn:    Local Event Bus installed. This is not recommended for production.
info:    Locking module: Using "in-memory" as default.
info:    No workflow to load from ...\@medusajs\draft-order\.medusa\server\src\workflows. skipped.
info:    No subscriber to load from ...\@medusajs\draft-order\.medusa\server\src\subscribers. skipped.

info:    === Resolve seeded test data ===
info:    Hook Z/016: 01KRR54B6BRSXVBCJVHSVSYMV6
info:    Generation octavia-3: 01KRR54B664GN97XJP3AKARMWC
info:    BikeRack BR-TEST-01: 01KRR54B6GJCMB0BPRC3EAN6ZP
info:    StandaloneWiring SW-TEST-01: 01KRR54B6NHVKBGGTY47YFGCSW

info:    === 1/3: createProductFromHook (Skoda Octavia 3) ===
info:      → Product prod_01KRR5P2VJZ9TBW6R4XTH70HYT
info:         title: Hak holowniczy Skoda Octavia Octavia 3 2013-2019 1800kg Z/016
info:         handle: hak-holowniczy-skoda-octavia-octavia-3-2013-2019-1800kg-z-016
info:         variants: 5
info:            • Z/016-octavia-3-BARE → wiring: — (BARE)
info:            • Z/016-octavia-3-W7 → wiring: W7
info:            • Z/016-octavia-3-W13 → wiring: W13
info:            • Z/016-octavia-3-M7 → wiring: M7
info:            • Z/016-octavia-3-M13 → wiring: M13

info:    === 2/3: createProductFromBikeRack (BR-TEST-01) ===
info:      → Product prod_01KRR5P2Y2RW34B5TW7D18BKSH
info:         title: Producent Testowy Bagażnik testowy - bagażnik rowerowy na hak 3 rowery BR-TEST-01
info:         handle: producent-testowy-bagaznik-testowy-bagaznik-rowerowy-na-hak-3-rowery-br-test-01
info:         variants: 1 | SKU: BR-TEST-01

info:    === 3/3: createProductFromStandaloneWiring (SW-TEST-01, universal) ===
info:      → Product prod_01KRR5P2ZHTE06CM5XX8EDSZ10
info:         title: Producent Testowy Moduł 13-Pin uniwersalny testowy Moduł 13-Pin uniwersalny SW-TEST-01
info:         handle: producent-testowy-modul-13-pin-uniwersalny-testowy-modul-13-pin-uniwersalny-sw-test-01
info:         variants: 1 | SKU: SW-TEST-01

info:    === Summary ===
info:    Created 3 products. Go to http://localhost:9000/app → Products to verify.
info:      • Hook product:    Hak holowniczy Skoda Octavia Octavia 3 2013-2019 1800kg Z/016 (5 variants)
info:      • BikeRack product: Producent Testowy Bagażnik testowy - bagażnik rowerowy na hak 3 rowery BR-TEST-01 (1 variant)
info:      • SW product:      Producent Testowy Moduł 13-Pin uniwersalny testowy Moduł 13-Pin uniwersalny SW-TEST-01 (1 variant, universal — no fitment)
info:    Finished executing script.
```

Exit code: `0` (sukces).

---

## 9. Sprawdzenie produktów w Medusa Admin

**ZRÓB SCREENSHOT** strony http://localhost:9000/app/products i wstaw tutaj.

(Claude Code nie ma dostępu do screenshotów GUI — user dorzuca osobno do czatu z Claude w claude.ai.)

Co powinno być widoczne na liście produktów:
- **Hak holowniczy Skoda Octavia Octavia 3 2013-2019 1800kg Z/016** — status `draft`, 5 wariantów (BARE/W7/W13/M7/M13), ceny 420/480/530/580/700 PLN
- **Producent Testowy Bagażnik testowy - bagażnik rowerowy na hak 3 rowery BR-TEST-01** — status `draft`, 1 wariant, cena 1200 PLN
- **Producent Testowy Moduł 13-Pin uniwersalny testowy Moduł 13-Pin uniwersalny SW-TEST-01** — status `draft`, 1 wariant, cena 350 PLN

Plus ewentualne sample produkty z templatki Medusy (T-Shirt, Sweatshirt, Sweatpants, Shorts) — jeśli zostały po `initial-data-seed.ts`. Admin może je usunąć ręcznie.

---

## 10. Odstępstwa od briefu #1 v2.1

### 10.1. SKU dla wariantów haków — rozszerzony format

**Brief §8:** `"{catalog.catalog_number}-{wiring.code or 'BARE'}"` → np. `"Z/016-M13"`
**Implementacja:** `"{catalog_number}-{generation_code}-{variant_code}"` → np. `"Z/016-octavia-3-M13"`

**Powód:** Medusa `product_variant.sku` ma globalny UNIQUE constraint. Z jednego Hooka workflow tworzy N Productów (po jednym per generacja), każdy z tymi samymi 5 wariantami. Bez generation code SKU duplikowały się przy pierwszej próbie utworzenia drugiego produktu. Generation code w SKU rozwiązuje konflikt natywnie (i ułatwia identyfikację wariantu w panelu).

Analogiczne odstępstwo dla `standalone_wiring` per-gen: `"{catalog_number}-{generation_code}"` zamiast tylko `"{catalog_number}"`.

### 10.2. Typy `text` zamiast `enum` dla niektórych pól

**Brief §3-5:** `wiring_equipment.pin_count: enum (7, 13)`, `bike_rack.power_socket: enum (7-pin, 13-pin)`, `standalone_wiring.pin_count: enum (7, 13)`
**Implementacja:**
- `wiring_equipment.pin_count` → `model.number()` (7 lub 13)
- `standalone_wiring.pin_count` → `model.number()`
- `bike_rack.power_socket` → `model.text()` (string `"7-pin"` lub `"13-pin"`)

**Powód:** GraphQL enum values muszą być valid identifiers (zaczynać od litery, bez myślnika). Wartości `"7"`, `"13"`, `"7-pin"`, `"13-pin"` nie spełniają tego wymogu, więc `model.enum(...)` rzuca błąd parsera GraphQL. Walidacja allowed values pójdzie do Zod schemy na endpointach (Faza 2 — formularze admin, Faza 3 — frontend).

Pola które ZACHOWANE jako enum: `wiring_equipment.type` i `standalone_wiring.type` (`"harness"` | `"module"` — valid identifiers).

### 10.3. `weight_kg` jako integer (Medusa quirk)

**Brief §3:** Wszystkie `weight_kg` mają być `number` (sugerowany 1.5 dla wiązek, 10 dla haków, 17 dla bagażników).
**Implementacja:** Medusa `model.number()` mapuje na PG `integer`. Dla wiązek w seedzie zaokrąglono z 1.5 → 2.

**Powód:** Medusa v2.15.2 `model.number()` nie ma opcji float/decimal w tej wersji. `model.bigNumber()` istnieje ale jest przeznaczony do cen (Big.js w runtime — overhead). Decyzja: integer wystarczy dla MVP, refactor gdy precyzja decimal okaże się prod-critical (raczej nie dla wagi).

### 10.4. `ProductVariant ↔ WiringEquipment` — link zdefiniowany ale niefunkcjonalny

**Brief §6:** Link M:1 nullable między wariantem haka a `WiringEquipment` (BARE bez linku, pozostałe 4 z linkiem).
**Implementacja:**
- Plik `src/links/variant-wiring-equipment.ts` istnieje, `defineLink` poprawnie skonfigurowany, tabela linku wygenerowana
- `link.create()` rzuca `"Cannot create multiple links between 'product' and 'wiring_equipment'"` w Medusie 2.15.2 — link service nie rozróżnia Product vs ProductVariant pod tym samym `serviceName: "product"` przy multi-record create
- **Workaround:** `wiring_equipment_id` i `wiring_equipment_code` zapisywane w `variant.metadata` jako jsonb

**Powód:** Bug/quirk w Medusie 2.15.2. Plik linku zostawiony do wpięcia gdy Medusa to naprawi (lub przy upgrade do v2.16+). Query `variant.metadata.wiring_equipment_id` daje tę samą funkcjonalną informację z perspektywy frontendu.

### 10.5. Module Link M:N wymaga `isList: true` na obu stronach

**Brief §6:** Link `Product ↔ Generation` M:N.
**Implementacja:** Wymagało `isList: true` na **obu** linkable'ach (nie tylko po stronie Generation). Bez tego `product.generations` działało, ale odwrotny query `generation.products` rzucał `"Entity 'Generation' does not have property 'products'"`. Po dodaniu `isList: true` po stronie Product → działa w obie strony.

To nie jest odstępstwo od briefu (brief mówi tylko że link jest M:N, nie jak go zdefiniować). To uwaga dla autora briefu #2 — gdy będzie definiował nowe linki M:N, niech pamięta o `isList: true` po obu stronach.

### 10.6. Endpoint `/store/vehicle-fitment/models/:modelId/generations`

**Brief §10:** Sugestia URL `/store/vehicle-fitment/models/:modelCode/generations`
**Implementacja:** `/store/vehicle-fitment/models/:modelId/generations` (id, nie code).

**Powód:** `vehicle_model.code` ma unique constraint tylko per brand (`(brand_id, code)`). Bez brand kontekstu lookup byłby ambiguous (np. `code="octavia"` może istnieć w Skoda i Volvo). `lookup` endpoint zwraca model `id` obok `code`, więc frontend bez problemu zbuduje request.

### 10.7. Pole `power_socket` w `bike_rack`

**Brief §4:** `power_socket: enum (7-pin, 13-pin)`
**Implementacja:** `power_socket: text()` (wymuszone przez GraphQL enum constraints, patrz §10.2). Walidacja allowed values w Zod na poziomie API.

### 10.8. Domyślna `option` dla single-variant produktów

**Brief §7:** "Bez ProductOption (jeden wariant)" dla bagażników i wiązek standalone
**Implementacja:** Medusa core flow `createProductsWorkflow` wymaga **przynajmniej jednej** `ProductOption` per Product (nawet single-variant). Dodano: `options: [{ title: "Wariant", values: ["Standardowy"] }]` + variant ma `options: { Wariant: "Standardowy" }`.

**Powód:** Ograniczenie Medusy core — bez option `createProductsWorkflow` rzuca `"Product options are not provided for: [...]"`. Default option `Wariant=Standardowy` jest UI-friendly (admin może go zignorować). Brief nie precyzował zachowania w obliczu tego ograniczenia, więc zastosowano minimalny workaround.

### 10.9. Brak `Modules.PRODUCT.linkable.bikeRack` namespace — sprawdzenie

Wszystkie nazwy linkable'ów odpowiadają konwencji `<entity_in_camelCase>` zgodnie z modelami:
- `HookCatalogModule.linkable.hook` ← `Hook` model
- `BikeRackCatalogModule.linkable.bikeRack` ← `BikeRack` model
- `StandaloneWiringCatalogModule.linkable.standaloneWiring` ← `StandaloneWiring` model
- `WiringEquipmentModule.linkable.wiringEquipment` ← `WiringEquipment` model
- `VehicleFitmentModule.linkable.{brand, vehicleModel, generation}` ← 3 modele

To nie jest odstępstwo — to konwencja generowania linkable z `MedusaService({...})`.

---

## 11. Problemy / nierozwiązane sprawy

### 11.1. `variant.metadata.wiring_equipment_id` zamiast prawdziwego linku

**Stan:** Workaround dla Medusy 2.15.2 (patrz §10.4). Data zapisana w `variant.metadata` jako jsonb. Query `variant.metadata.wiring_equipment_id` daje dostęp do informacji.

**Konsekwencja dla Fazy 2 / 3:**
- Admin UI musi czytać `variant.metadata` zamiast `variant.wiring_equipment` (link)
- Frontend musi też czytać metadata przy renderowaniu wariantu haka (gallery, description merge)
- Filtrowanie produktów po `wiring_equipment` (`type`, `pin_count` itp.) z poziomu wariantu jest niemożliwe przez Medusa Query — trzeba albo:
  - Włączać `metadata.wiring_equipment_id` do indeksowanego pola (jsonb GIN index), albo
  - Łączyć w aplikacji po stronie frontu (mając lookup tabelę `WiringEquipment` w cache)

**Plan:** Sprawdzić Medusa 2.16+ — jeśli quirk naprawiony, wpiąć prawdziwy link i usunąć workaround.

### 11.2. `redisUrl not found. A fake redis instance will be used.` w logach

**Stan:** Medusa nie czyta `REDIS_URL` z `.env` na poziomie modułów event_bus / cache / workflow_engine — używa in-memory fallback. W dev to OK, ale `warn: Local Event Bus installed. This is not recommended for production.`

**Plan:** Przed Fazą 4 (integracje) lub Fazą 5 (deployment) — dodać do `medusa-config.ts`:
```typescript
{ resolve: "@medusajs/event-bus-redis", options: { redisUrl: process.env.REDIS_URL } },
{ resolve: "@medusajs/cache-redis", options: { redisUrl: process.env.REDIS_URL } },
{ resolve: "@medusajs/workflow-engine-redis", options: { redis: { url: process.env.REDIS_URL } } },
```

### 11.3. `query.graph` z głębokimi nested linkami zawodzi

**Stan:** Niektóre query w stylu `brand → models → generations → products` rzucają `"Cannot read properties of undefined (reading 'strategy')"` w Medusie 2.15.2.

**Workaround zaaplikowany:** Rozdzielenie na 2 query (entity-level + generation-level z `.products`) i agregacja w JS. Daje to samo, ale wymaga ręcznego "JOIN" w kodzie.

**Plan:** Sprawdzić Medusa 2.16+ przy ewentualnym upgrade.

### 11.4. Filtr `filters: { generations: { id }}` na `product` nie działa

**Stan:** Query `product` z filtrem po linkowanej generacji rzuca 500 w Medusie 2.15.2. Workaround: query od strony `generation` → pobierz `products.id` → fetch products po liście ID.

**Plan:** jw.

### 11.5. Filtry zakresowe (`$gte`, `$lte`) zaaplikowane w JS

**Stan:** Endpointy listing (np. `/store/categories/hooks/products?pulling_capacity_min=1500&pulling_capacity_max=2500`) filtrują po pobraniu danych z DB — pierwszy query bierze wszystkie produkty z `status: "published"`, potem filtruje w JS.

**Konsekwencja:** Działa OK dla MVP (do kilkuset produktów). Przy katalogu 1000+ trzeba zmigrować na natywne mikro-orm operatory (lub raw SQL) — gdy Medusa Query je wesprze w stable.

**Plan:** Optymalizacja przed lub w Fazie 5 (launch).

### 11.6. `wiring_equipment.weight_kg` zaokrąglone z 1.5 → 2

**Stan:** Brief mówił `1.5 kg`, w bazie integer `2`. Patrz §10.3.

**Konsekwencja:** Admin może wpisać dokładną wagę 1, 2, 3 itp. (integer). Dla wagi 1.5 — wpisuje 2 (lub 1).

**Plan:** Refactor do `numeric` column lub `model.bigNumber()` przed prod, jeśli waga z dziesiętnymi okaże się krytyczna.

### 11.7. `pulling_capacity_kg` jako integer

**Stan:** Wszystkie wagi i pojemności są `integer` (Medusa `model.number()` default).

**Konsekwencja:** Filtry zakresowe działają tylko na integers. Brief sugerował `number` co implikuje float, ale realne wartości są integer (1500, 1800, 2500 kg) — w praktyce OK.

**Plan:** Nie ruszamy — zostaje tak jak jest.

### 11.8. Endpointy templatkowe pozostawione w repo

**Stan:** Pliki `src/api/admin/custom/route.ts` i `src/api/store/custom/route.ts` z templatki `create-medusa-app` — placeholder'y eksponujące `/admin/custom` i `/store/custom`. Nie są zużyte, ale również nie szkodzą.

**Plan:** Usuń przy okazji clean-upu (np. w Fazie 2).

---

## Podsumowanie

**Co działa:**
- 5 modułów domeny w bazie (Brand/VehicleModel/Generation, Hook, WiringEquipment, BikeRack, StandaloneWiring) z poprawnymi indeksami i unique constraints zgodnie z briefem §11
- 4 z 5 Module Links realnie funkcjonalne (variant↔wiring jako metadata, patrz §10.4)
- 3 workflowy z `compensate` (Hook 5-variant, BikeRack 1-variant, StandaloneWiring rozgałęziony na `fits_all_vehicles`)
- 11 endpointów Store API (vehicle-fitment + by-vehicle + listing + landing) z filtrami i `product_count`
- Seed automatyczny przy `db:migrate` (4× WiringEquipment + Skoda/Octavia 3 + Hook Z/016 + BikeRack BR-TEST-01 + SW-TEST-01)
- `test-workflows.ts` przechodzi end-to-end → 3 produkty draft widoczne w `/app/products`

**Co przygotowane dla Fazy 2 (admin UI):**
- Wszystkie 5 modeli domeny dostępne przez `MedusaService` z auto-generowanym CRUD (create/list/retrieve/update/delete)
- Workflowy wystawiania produktów gotowe do wywołania z admin UI (np. button "Wystaw produkt" w widgecie)
- API endpointy listing per kategoria pokrywają wszystkie filtry briefu §10
- Shared utilities (`generateProductTitle`, `generateSku`, `generateProductHandle`) reużywane między workflows a potencjalnym admin preview

**Punkty do uwzględnienia w briefie #2:**
- Admin musi edytować `variant.metadata.wiring_equipment_id` zamiast linku (przejściowo)
- Formularze admin powinny używać Zod walidacji dla pól które są `text` na poziomie modelu ale mają allowed values (`power_socket`, `pin_count`)
- Endpoint `/admin/...` dla workflow trigger ("Wystaw produkt z hooka X dla generacji Y, Z" + ceny) jest do dodania w Fazie 2 — workflow już istnieje, brakuje admin endpointu który go odpala
- Autocomplete na pola tekstowe (`manufacturer`, `homologation`, `ball_type`) — wartości pobierane z listy istniejących rekordów Hook/BikeRack/SW (brak osobnej tabeli słownikowej)
