# bike_rack_catalog

Katalog bagażników rowerowych na hak (kategoria 2). Master record — jedna sztuka per model.
Z jednego `BikeRack` powstaje **jeden** `Product` z **jednym** `ProductVariant` (brak konfiguracji wariantowych).

## Encje

`BikeRack` — 20 pól:

**Identyfikacja:** `catalog_number` (unique), `name`, `manufacturer` (autocomplete).

**Pojemność / udźwig:**
- `max_bikes` — max liczba rowerów
- `max_bike_weight_kg` — max waga jednego roweru
- `max_total_load_kg` — max ładowność całkowita

**Parametry techniczne:**
- `power_socket` (enum): `7-pin` | `13-pin`
- `weight_kg` — waga bagażnika
- `length_cm` — długość
- `warranty_years` — default `2`

**Funkcje (booleans):** `has_lockable_attachment`, `has_rear_lights`, `has_tilt_function`, `tool_free_assembly`.

**Content:** `description_html`, `short_description?`, `thumbnail`, `gallery` (jsonb), `installation_manual_url?`.

## Indexy

Zgodnie z brief §11: `manufacturer`, `max_bikes`. `catalog_number` ma unique constraint.

## Brak relacji do vehicle_fitment ani Hook

Bagażnik to **niezależny produkt** — klient sam ocenia kompatybilność (różne haki obsługują różne gniazda elektryczne 7-pin/13-pin). Brief §4: "Brak linku do vehicle_fitment ani do Hooka."

## Brak wariantów

Brief §7: "Z jednego BikeRack powstaje jeden Product z jednym ProductVariant." Cena na wariancie (ręczna).
