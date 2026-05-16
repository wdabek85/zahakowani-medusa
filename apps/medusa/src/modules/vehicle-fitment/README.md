# vehicle_fitment

Drzewo pojazdów (Brand → VehicleModel → Generation) wspólne dla wszystkich kategorii produktowych które mają fitment do auta (haki, wiązki standalone bez `fits_all_vehicles=true`).

## Encje

| Model | Pola unique | Relacje |
|---|---|---|
| `Brand` | `code` | `models: hasMany(VehicleModel)` |
| `VehicleModel` | `(brand_id, code)` | `brand: belongsTo(Brand)`, `generations: hasMany(Generation)` |
| `Generation` | `(vehicle_model_id, code)` | `vehicle_model: belongsTo(VehicleModel)` |

## Helpery (na serwisie, nie w bazie)

- `getYearsLabel(year_from, year_to)` → `"2013-2019"` lub `"2013-obecnie"` (gdy `year_to = null`)
- `getGenerationFullName(generation)` → `"Skoda Octavia Octavia 3 2013-2019"` (do tytułów produktów)
- `getGenerationUrlSlug(generation)` → `"skoda/octavia/octavia-3-2013-2019"` (do SEO landing pages)

## Linkowanie z produktami

Moduł jest **read-only z perspektywy katalogów**. Linki tworzone w `src/links/`:
- `Product ↔ Generation` (M:N) — dla haków i wiązek standalone

## Brak relacji

Bagażniki rowerowe (`bike_rack_catalog`) **NIE** linkują do `vehicle_fitment` — są uniwersalne.
