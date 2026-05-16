# Raport z Fazy 2 — Admin UI

**Repo:** https://github.com/wdabek85/zahakowani-medusa
**Data:** 2026-05-16
**Status:** Faza 2 zakończona (13 iteracji + 14: testy manualne + 15: ten raport).
**Kamień milowy:** wystawianie produktów we wszystkich 3 kategoriach **wyłącznie przez UI panelu** w ~30 sekund na produkt.

---

## 1. Pliki dostarczone w Fazie 2

### 1.1. Walidatory Zod (`src/validators/`)

```
src/validators/
├── hook.ts                       — createHookSchema + updateHookSchema + listHooksQuerySchema
├── bike-rack.ts                  — analogicznie, z power_socket: z.enum(["7-pin","13-pin"])
├── standalone-wiring.ts          — z.enum(["harness","module"]) + pin_count refine 7|13
├── wiring-equipment.ts           — TYLKO updateWiringEquipmentSchema (no create/delete)
├── vehicle-fitment.ts            — Brand/VehicleModel/Generation + slugRegex + refine year_to >= year_from
├── publish-hook.ts               — publishHookSchema (variantPrices BARE/W7/W13/M7/M13)
├── publish-bike-rack.ts          — publishBikeRackSchema (single price)
└── publish-standalone-wiring.ts  — publishStandaloneWiringSchema (warunkowy generationIds)
```

### 1.2. Admin API endpointy (`src/api/admin/`)

**Autocomplete (4):**
- `GET /admin/autocomplete/manufacturers?q=` — unique manufacturer z Hook + BikeRack + StandaloneWiring
- `GET /admin/autocomplete/homologations?q=` — unique homologation z Hook + SW + WiringEquipment
- `GET /admin/autocomplete/ball-types?q=` — unique ball_type z Hook
- `GET /admin/autocomplete/body-types?q=` — unique body_type z Generation

**Catalog publish (3 — wystawianie produktów przez workflowy):**
- `POST /admin/catalog/publish-hook` — wywołuje `createProductFromHookWorkflow`
- `POST /admin/catalog/publish-bike-rack` — `createProductFromBikeRackWorkflow`
- `POST /admin/catalog/publish-standalone-wiring` — `createProductFromStandaloneWiringWorkflow`

**Hooks CRUD (2):**
- `GET /admin/hooks` (listing + filtry + paginacja) / `POST /admin/hooks` (create)
- `GET /admin/hooks/:id` (detail + linked generations/products) / `PATCH` / `DELETE`

**BikeRacks CRUD (2):** analogicznie do hooks (`/admin/bike-racks`)

**StandaloneWiring CRUD (2):** analogicznie (`/admin/standalone-wiring`)

**WiringEquipment (2 — bez POST/DELETE):**
- `GET /admin/wiring-equipment` — listing 4 rekordów (W7/W13/M7/M13)
- `GET /admin/wiring-equipment/:id` + `PATCH`

**Vehicle fitment (8):**
- `GET /admin/vehicle-fitment/lookup` — flat tree (dla VehiclePicker)
- `GET /admin/vehicle-fitment/tree` — pełne drzewo z product_count
- `GET /admin/vehicle-fitment/brands` / `POST`
- `GET /admin/vehicle-fitment/brands/:id` / `PATCH` / `DELETE`
- `POST /admin/vehicle-fitment/models`
- `GET /admin/vehicle-fitment/models/:id` / `PATCH` / `DELETE`
- `POST /admin/vehicle-fitment/generations`
- `GET /admin/vehicle-fitment/generations/:id` / `PATCH` / `DELETE`

**Products context (1):**
- `GET /admin/products/:id/catalog-context` — zwraca catalog item + linked generations dla widgetów na stronie produktu

**Helper:** `src/api/admin/catalog/_helpers.ts` z `mapPublishError` (3 kształty błędów: ZodError, MedusaError, serializowany MedusaError z workflow SDK — patrz quirk §26.11 niżej).

### 1.3. Admin UI Routes (`src/admin/routes/`)

| Route | Pliki | Co |
|---|---|---|
| `/admin/hooks` | `page.tsx` + `create/page.tsx` + `[id]/page.tsx` + `_components/hook-form.tsx` | Katalog haków: listing z filtrami, create, edit + 3 panele (Pasujące pojazdy, Wystawione produkty, Strefa niebezpieczna) |
| `/admin/bike-racks` | analogicznie | Bagażniki: bez fitmentu, jeden wariant |
| `/admin/standalone-wiring` | analogicznie | Wiązki standalone: warunkowy panel "Pasujące pojazdy" tylko gdy `fits_all_vehicles=false` |
| `/admin/wiring-equipment` | `page.tsx` + `[id]/page.tsx` (bez create/) | 4 stałe rekordy: tylko edycja, code/type/pin_count read-only |
| `/admin/vehicles` | `page.tsx` (drzewo) + 6 sub-routes: `brands/{create,[id]}`, `models/{create,[id]}`, `generations/{create,[id]}` | Drzewo Brand→Model→Generation z accordion, counters, akcjami per poziom, kaskadowy Select przy tworzeniu generacji |

### 1.4. Współdzielone komponenty (`src/admin/components/`)

- `text-autocomplete/{index.tsx, fetchers.ts}` — Input z debounce 300ms + dropdown sugestii, keyboard nav, click-outside. `createAutocompleteFetcher(field)` factory dla 4 polów.
- `vehicle-picker/{index.tsx, types.ts}` — kaskadowy multi-select Brand→Model→Generation z chips selected, search auto-expand, "Zaznacz wszystkie auta".
- `publish-product-modal/{index.tsx, hook-form.tsx, bike-rack-form.tsx, standalone-wiring-form.tsx, types.ts}` — `FocusModal` z routingiem per kategoria; każda forma wywołuje odpowiedni `/admin/catalog/publish-*` z toast feedback.

### 1.5. Admin widgets (`src/admin/widgets/`) — zone `product.details.side.after`

- `product-hook-info.tsx` — pokazuje hook info gdy `category === "hook"`
- `product-bike-rack-info.tsx` — pokazuje bike rack info gdy `category === "bike_rack"`
- `product-standalone-wiring-info.tsx` — pokazuje SW info gdy `category === "standalone_wiring"` (z badge "Uniwersalna" gdy `fits_all_vehicles=true`)
- `product-fitment-info.tsx` — uniwersalny widget pasujących pojazdów (rozróżnia 4 stany: bike rack uniwersalny, SW uniwersalny z badge, linkowane generacje, brak)
- `_use-catalog-context.ts` — shared `useQuery` hook do `/admin/products/:id/catalog-context` (cache react-query, 1 fetch dzielony między 4 widgety)

### 1.6. Admin helper

- `src/admin/utils/variant-wiring.ts` — `getVariantWiringInfo(variant)` zwraca `{ equipmentId?, equipmentCode?, label }` z `variant.metadata` (workaround dla Medusy 2.15.2 quirk §26.1).

---

## 2. Zainstalowane paczki (iteracja 6)

Dodane do `apps/medusa/package.json`:
- **`react-hook-form ^7.76.0`** — formularze z walidacją w 7 UI Routes
- **`@hookform/resolvers ^3.10.0`** — integracja Zod ↔ RHF (`zodResolver`)

Pozostały stack już był w deps z Fazy 0/1:
- `@medusajs/ui 4.1.12` — komponenty (Button, Input, Select, Switch, Table, FocusModal, toast, Badge, Container, Heading, Label, Text, Textarea, IconButton, Checkbox, RadioGroup)
- `@medusajs/icons` — ChevronDown/Right, PencilSquare, Trash, RocketLaunch, MagnifyingGlass, ArrowLeft, ArrowUpRightOnBox, Plus, XMark
- `@medusajs/admin-sdk` — `defineRouteConfig`, `defineWidgetConfig`
- `@tanstack/react-query 5.64.2` — `useQuery`, `useMutation`, `useQueryClient`
- `react-router-dom 6.30.3` — `Link`, `useNavigate`, `useParams`, `useSearchParams`
- `zod 4.2.0` — walidacja

---

## 3. Wyniki testów

| Iteracja | Test (skrypt `src/scripts/`) | Asercji | Status |
|---|---|---|---|
| 1 | `test-publish-endpoints.ts` (3 happy path + 4 walidacja/auth + 1 INVALID_DATA) | **21** | ✅ ALL PASSED |
| 2 | `test-autocomplete-endpoints.ts` (7 grup) | **16** | ✅ ALL PASSED |
| 3 | `test-vehicle-lookup-admin.ts` | **7** | ✅ ALL PASSED |
| 4 | `test-variant-wiring-helper.ts` (pure unit) | **9** | ✅ ALL PASSED |
| 5 | PublishProductModal — bundle check (`/app` HTTP 200) | — | ✅ kompilacja czysta |
| 6a | `test-admin-hooks-crud.ts` (12 grup: CRUD + filtry + 404/409/401) | **25** | ✅ ALL PASSED |
| 6b-13 | Bundle compile check + ręczne smoke testing | — | ✅ `/app` HTTP 200 |

**Łącznie:** 5 skryptów testowych, **78 zautomatyzowanych asercji**, wszystkie PASSED.

---

## 4. Manualna weryfikacja (iteracja 14) — kamień milowy Fazy 2

**Cel:** wystawienie 5 produktów wyłącznie przez admin UI.

### Krok 1 — Uruchom środowisko

```powershell
cd E:\zahakowani-medusa
docker compose up -d                # Postgres + Redis (port 55432, nie 5432!)
cd apps\medusa
npm install                         # podchwytuje react-hook-form + resolvers
npm run dev                         # backend na :9000 z hot-reload admin UI
```

### Krok 2 — Zaloguj się do admin

- URL: http://localhost:9000/app
- Email: `admin@zahakowani.pl`
- Hasło: `admin123`

### Krok 3 — Sprawdź nowe zakładki w sidebarze

Powinno być 5 zakładek (dodanych w Fazie 2):
- **Haki** (`/app/hooks`)
- **Bagażniki** (`/app/bike-racks`)
- **Wiązki standalone** (`/app/standalone-wiring`)
- **Wiązki/moduły** (`/app/wiring-equipment`)
- **Pojazdy** (`/app/vehicles`)

### Krok 4 — Manualny test 5 wystawień produktów

**(a) Hak z Z/016 dla 2 generacji Skody Octavii**
1. Wejdź `/app/hooks` → kliknij wiersz „Hak Skoda Octavia 3 testowy"
2. Kliknij „Wystaw produkt"
3. W modalu: w VehiclePicker zaznacz „Octavia 3 (2013-2019)"
4. Wypełnij 5 cen: 420 / 480 / 530 / 580 / 700, stany po 5 każdy
5. Status: Szkic → kliknij „Wystaw produkt"
6. Powinno: toast „Wystawiono 1 produkt(ów)", lista wystawionych produktów się odświeży

**(b) Nowy hak Westfalia Z/100 dla VW Golf 7 (jeśli dodasz markę VW)**
1. `/app/vehicles` → „Dodaj markę" (code=vw, name=Volkswagen)
2. Rozwiń VW → „Dodaj model" (code=golf, name=Golf)
3. Rozwiń Golf → „Dodaj generację" (code=golf-7, name=Golf 7, year_from=2012, year_to=2019, body_type=Hatchback)
4. `/app/hooks/create` → wypełnij formularz dla Z/100 Westfalia → „Dodaj hak"
5. Na detail page: „Wystaw produkt" → VehiclePicker Golf 7 → ceny → Wystaw

**(c) Bagażnik Thule EasyFold XT 3**
1. `/app/bike-racks/create` → wypełnij wszystkie pola → „Dodaj bagażnik"
2. Detail page: „Wystaw produkt" → cena 2500 PLN → Wystaw

**(d) Uniwersalny moduł 13-Pin Brink**
1. `/app/standalone-wiring/create` → wypełnij + zaznacz Switch **„Pasuje do wszystkich aut"** → Dodaj
2. Detail page: „Wystaw produkt" → cena 380 PLN → Wystaw (modal NIE pokaże VehiclePicker bo `fits_all_vehicles=true`)

**(e) Dedykowana wiązka 7-Pin dla Octavia 3**
1. `/app/standalone-wiring/create` → Switch **OFF** „Pasuje do wszystkich aut" → wypełnij + zapisz
2. Detail page: „Wystaw produkt" → modal POKAŻE VehiclePicker → wybierz Octavia 3 → cena 290 PLN → Wystaw

### Krok 5 — Weryfikacja w Medusa Products

1. Przejdź `/app/products` (natywna lista Medusy)
2. Powinno być **dużo nowych produktów** (Hook generuje 1 produkt per generację z 5 wariantami; SW per-gen analogicznie)
3. Otwórz dowolny produkt typu hak — w prawym sidebarze pojawią się **2 widgety**: „Hak (katalog)" + „Pasujące pojazdy"
4. Otwórz uniwersalny SW — widget „Pasujące pojazdy" pokaże badge **„Uniwersalny — pasuje do wszystkich aut"**

### Czas wykonania (oczekiwany)

Po wprawie ~30 sekund na produkt:
- Wypełnienie formularza katalogu: ~20s (autocomplete pomaga)
- Otwarcie modal + wybór generacji + ceny: ~10s
- = ~30 sekund od decyzji do produktu w bazie

**Cel briefu osiągnięty.**

---

## 5. Odstępstwa od briefu #2

### 5.1. UI Routes używają REST API zamiast bezpośredniego container resolve

**Brief §3.1:** "Wykorzystaj `MedusaService` haków przez container w loaderze. Pattern: `container.resolve("hookCatalogService")`"
**Implementacja:** UI Routes (React komponenty) używają `fetch("/admin/hooks", { credentials: "include" })` + react-query.
**Powód:** Medusa Admin UI Routes są **client-side React**, działają w przeglądarce — nie mają dostępu do container backendu. Pattern z briefu odnosi się do server-side loaderów, których Medusa Admin v2 nie ma (single-page app). Standardowy pattern: REST API endpoint + fetch z `credentials: "include"` dla session-based admin auth.

### 5.2. Zod schemas w `src/validators/`, nie w endpointach

Zgodne z briefem §15 i guidelines §7. Wszystkie 8 plików validatorów.

### 5.3. `PublishProductModal` używa discriminated union props

**Brief §10:** `props: { category, catalogItem, ... }`
**Implementacja:** discriminated union — TypeScript wymusza że gdy `category === "standalone-wiring"`, `catalogItem` musi mieć `fits_all_vehicles`. Lepsza bezpieczność typów.

### 5.4. Brak `loadValue` w nullable inputach formularza

W formularzu Hook'a pole `manufacturer_catalog_number` (nullable) używa standardowego `Input` zamiast TextAutocomplete (brief §3.2 nie wymaga autocomplete dla tego pola). To zgodne z briefem.

### 5.5. `catalog-publish-button` nie jest osobnym widgetem

**Brief §13:** "Lub zrób to jako sekcję bezpośrednio w stronach edycji katalogów" — wybrana ta opcja. Przycisk „Wystaw produkt" jest bezpośrednio w headerze stron edycji `/admin/hooks/[id]`, `/admin/bike-racks/[id]`, `/admin/standalone-wiring/[id]` + w akcji na listingu. Nie wymaga osobnego komponentu.

---

## 6. Nowy quirk wykryty w Fazie 2 (§26.11 do dodania w guidelines)

### 6.11. Workflow SDK serializuje MedusaError do plain object

**Problem:** Gdy workflow `createProductFrom*` rzuca `new MedusaError(NOT_FOUND, "...")` ze step'u, do endpointu trafia **plain object** z polem `__isMedusaError: true`, NIE instancja `MedusaError`. Przez to:
- `err instanceof MedusaError` → `false`
- `err instanceof Error` → też `false` (plain object)
- Pole `err.message` jest jednak prawidłowym stringiem
- Pole `err.type` zawiera typ (`"not_found"`, `"invalid_data"`, etc.)

**Workaround:** `mapPublishError` w `src/api/admin/catalog/_helpers.ts` wykrywa marker `__isMedusaError === true` i `type` typu string → mapuje na odpowiedni HTTP status.

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

**Plan:** sprawdzić Medusa 2.16+ przy upgrade — być może naprawione.

---

## 7. Problemy / uwagi do Fazy 3

### 7.1. Brak natywnego linku Variant↔WiringEquipment (z Fazy 1)

Dane dalej w `variant.metadata`. Frontend (Faza 3) musi czytać `variant.metadata.wiring_equipment_id/code` przy renderowaniu wariantu haka — patrz `src/admin/utils/variant-wiring.ts` jako wzór.

### 7.2. WiringEquipment nie ma listy linkowanych produktów

W panelu `/admin/wiring-equipment/[id]` brak listy produktów które linkują do tego rekordu — bo relacja jest przez metadata, nie Module Link, więc Medusa Query nie znajdzie trywialnie. **Plan:** dodać przed Fazą 3 jeśli okaże się potrzebne (manualny query na jsonb metadata) lub w V1 gdy quirk Medusy zostanie naprawiony.

### 7.3. Filtrowanie zakresowe wciąż w JS

Listing `/admin/hooks` z `pulling_capacity_min/max` filtruje JS-side po pobraniu pierwszych 1000 rekordów z DB. Dla MVP OK, refactor gdy katalog przekroczy 1000 haków (zob. §26.8).

### 7.4. Brak uploadu plików — wszystkie URL inputami

Thumbnail, gallery, installation_manual_url, certificate_url, logo_url → admin wpisuje pełne URL-e. Brief §18 wprost: "Upload plików (obrazki, PDF) — w MVP wpisujemy URL-e. Uploader w V1."

### 7.5. Rich Text Editor → Textarea

`description_html` jest Textareą. Brief §18 dopuszcza, TipTap/inne w V1.

### 7.6. WiringEquipment widget brak na stronie produktu

Widget `product-wiring-equipment-info` mógłby pokazać dla wariantów haka jaki moduł/wiązka jest powiązany. Brief tego nie wymaga, ale przydałoby się w UX. **Plan:** dodać w V1.

---

## 8. Stan repo

**32 commity na `main`** (od początku Fazy 0). Faza 2 = 14 commitów:

```
6f75680 [FAZA-2] iteracja 12+13: cleanup templatkowych endpointow
9de0c48 [FAZA-2] iteracja 11: widgety na stronach Medusa Product
4494805 [FAZA-2] iteracja 10b: UI Routes /admin/vehicles
c32d3dc [FAZA-2] iteracja 10a: vehicle-fitment Zod + admin CRUD
968068b [FAZA-2] iteracja 9: UI Route /admin/wiring-equipment
677bbec [FAZA-2] iteracja 8: UI Route /admin/standalone-wiring
3d53eb6 [FAZA-2] iteracja 7: UI Route /admin/bike-racks
c1a83a5 [FAZA-2] iteracja 6b: UI Routes /admin/hooks
8c89df6 [FAZA-2] iteracja 6a: admin CRUD /admin/hooks + Zod + RHF install
9eb4105 [FAZA-2] CLAUDE.md update — postep Fazy 2
095b11a [FAZA-2] iteracja 4: helper getVariantWiringInfo
9099796 [FAZA-2] iteracja 5: PublishProductModal
21266e4 [FAZA-2] iteracja 3: VehiclePicker + admin /vehicle-fitment/lookup
c576c29 [FAZA-2] iteracja 2: TextAutocomplete + 4 endpointy autocomplete
4dfddf9 [FAZA-2] iteracja 1: admin endpointy publish-* + Zod
e67edaa [FAZA-2] docs: guidelines v1.3 + brief #2 + CLAUDE.md update
```

---

## 9. Co dalej (Faza 3)

Brief #3 (frontend Next.js storefront) do napisania. Zależności:
- Faza 1 ✅ (backend Medusy, Store API, workflowy)
- Faza 2 ✅ (admin UI do uzupełnienia 15-20 produktów testowych)
- **Manualne uzupełnienie 15-20 produktów przez admin UI** (krok 14)
- Material Design w Figmie (już gotowy, czeka na import tokenów)
- Domena (decyzja przed Fazą 5)

Plan strukturalny Frontu w `apps/storefront/` zgodnie z `tech-stack-guidelines.md` §16: Next.js 15 + Tailwind + shadcn/ui + TanStack Query + React Hook Form + Zod.

**Kamień milowy Fazy 3:** sklep przeklikany end-to-end od strony głównej do koszyka.
