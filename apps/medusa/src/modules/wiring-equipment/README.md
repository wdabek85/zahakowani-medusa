# wiring_equipment

**Nie jest to kategoria produktowa.** To referencyjne dane — 4 reużywane rekordy (W7, W13, M7, M13) używane jako warianty haka (kategoria 1). Warianty `ProductVariant` linkują do `WiringEquipment` przez link M:1 w `src/links/variant-wiring-equipment.ts`.

## Encje

`WiringEquipment`:
- `code` (unique): `W7`, `W13`, `M7`, `M13`
- `type` (enum): `harness` | `module`
- `pin_count`: 7 lub 13 (number, walidacja w Zod schema na poziomie API)
- `name`: `Wiązka 7-Pin`, `Wiązka 13-Pin`, `Moduł 7-Pin`, `Moduł 13-Pin`
- `weight_kg`: waga samego elementu (dodawana do `hook.weight_kg` przy generowaniu wariantu)
- `description_html`: wspólna specyfikacja modułu (wyświetlana na karcie produktu po wybraniu wariantu)
- Flagi funkcji: `has_fog_lights`, `has_reverse_lights`, `has_stop_lights`, `has_indicators`
- `homologation`: np. `E20`
- `gallery` (jsonb): tablica URL-i zdjęć samego modułu/wiązki

## Seed (4 rekordy, automatyczny przy `db:migrate`)

Migration script `src/migration-scripts/seed-wiring-equipment.ts` tworzy 4 rekordy z testowymi wartościami (zgodnie z brief §3). Wszystkie 4 mają identyczne wartości techniczne — celowo, finalne dane podmieni admin przez panel po Fazie 2.

## Brak `price_delta`

Brief §3: brak pola na deltę ceny. Ceny wariantów wpisywane ręcznie per produkt w workflowie `createProductFromHook`.

## Uwaga o precyzji wagi

`weight_kg` jest mapowane na `integer` przez Medusę. Brief sugeruje wagę 1.5 kg dla wiązek; w seedzie zaokrąglone do 2. Jeśli precyzja decimal okaże się potrzebna w prod — refactor do `model.bigNumber()` lub custom numeric column.
