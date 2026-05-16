# standalone_wiring_catalog

Katalog wiązek i modułów sprzedawanych **samodzielnie** (kategoria 3). Niezależny od `wiring_equipment` (kategoria 1, gdzie wiązki są wariantami haka).

## Encje

`StandaloneWiring` — 19 pól, w tym **kluczowa flaga `fits_all_vehicles`**.

**Identyfikacja:** `catalog_number` (unique), `name`, `manufacturer` (autocomplete).

**Charakterystyka elektryczna:**
- `type` (enum): `harness` | `module`
- `pin_count` (number): 7 lub 13 (walidacja Zod na poziomie API)
- `weight_kg`, `homologation`, `warranty_years` (default `2`)

**Funkcje (booleans):** `has_fog_lights`, `has_reverse_lights`, `has_stop_lights`, `has_indicators`.

**`fits_all_vehicles`** ⭐ — jeśli `true`:
- Produkt pasuje do każdego auta → workflow nie wymaga `generationIds`
- Brak linków do `Generation` → globalnie dostępny
- Pojawia się w wynikach wyszukiwarki cross-category **dla każdej** generacji

Jeśli `false`:
- Wymagane `generationIds` w workflowie → linki M:N do `Generation`
- Produkt widoczny tylko dla pojazdów do których został podlinkowany

**Content:** `description_html`, `short_description?`, `thumbnail`, `gallery` (jsonb), `installation_manual_url?`.

## Indexy

Zgodnie z brief §11: `fits_all_vehicles` (filtrowanie uniwersalnych), `(type, pin_count)` composite (filtry kategorii), `manufacturer`. `catalog_number` unique.

## Brak wariantów

Brief §7: "Z jednego StandaloneWiring powstaje jeden Product z jednym ProductVariant."

## Workflow

`createProductFromStandaloneWiring` — gałąź logiki zależna od `fits_all_vehicles`:
- `true` → 1 Product (uniwersalny), bez linków do Generation
- `false` → N Productów (po jednym per Generation z `generationIds`), każdy z linkiem
