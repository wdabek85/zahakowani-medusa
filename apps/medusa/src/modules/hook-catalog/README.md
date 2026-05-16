# hook_catalog

Katalog haków holowniczych (kategoria 1). Master record — jedna sztuka per model haka.
Z jednego `Hook` powstaje wiele `Product` (jeden per generacja auta) workflowem `createProductFromHook`.

## Encje

`Hook` — 18 pól:

**Identyfikacja:**
- `catalog_number` (unique) — wewnętrzny nr, np. `Z/016`
- `name` — nazwa wewnętrzna
- `manufacturer` (autocomplete w UI) — `Imioła Hak-Pol`, `Westfalia`, etc.
- `manufacturer_catalog_number?` — nr producenta jeśli różny

**Parametry techniczne:**
- `pulling_capacity_kg` — uciąg (filtr zakresowy)
- `vertical_load_kg` — nacisk na kulę
- `homologation` (autocomplete) — `E20`, `E11`
- `ball_type` (autocomplete) — `Odkręcana`, `Stała`, `Automatyczna`
- `requires_bumper_cutting` — boolean, default `false`
- `warranty_years` — default `2`
- `weight_kg` — waga samego haka (bez wiązki)

**Content:**
- `description_html` — główny opis (używany przez wszystkie produkty/warianty)
- `short_description?`
- `thumbnail` — URL głównego obrazka
- `gallery` (jsonb) — tablica URL-i zdjęć samego haka
- `installation_manual_url?`, `certificate_url?` — PDF-y

**Brak ceny** — cena żyje na `ProductVariant`, wpisywana ręcznie per wariant przy wystawianiu.

## Indexy

Zgodnie z brief §11: `manufacturer`, `pulling_capacity_kg`, `ball_type` (filtry kategorii + wyszukiwarka).
`catalog_number` ma unique constraint (automatyczny index).

## Linkowanie

W `src/links/product-hook.ts` (M:1): jeden Product → jeden Hook.
Hook to master record, Product to instancja per generacja auta.
