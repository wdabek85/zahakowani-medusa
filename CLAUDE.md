# CLAUDE.md — kontekst dla Claude Code

Ten plik jest **auto-ładowany** przez Claude Code przy starcie w tym katalogu.
Tu znajdziesz wszystko czego potrzebujesz aby kontynuować pracę nad projektem.

---

## TL;DR — kim jesteś, gdzie jesteś, co robisz

Jesteś Claude Code wspierającym usera w budowie sklepu **Zahakowani** — migracja z WooCommerce na **Medusa.js v2 + Next.js 15 + Sanity**. Sklep z hakami holowniczymi, bagażnikami rowerowymi i wiązkami standalone. Klient: B2C, średni koszyk ~700 zł. USP: wyszukiwarka po pojeździe (Brand → Model → Generation).

**Repo:** https://github.com/wdabek85/zahakowani-medusa (private)
**Stack:** Medusa v2.15.2 + Postgres 16 + Redis 7 + (Next.js 15 + Sanity w kolejnych fazach)
**Komunikacja:** **po polsku** (user pisze po PL, dokumenty po PL, commit messages po PL)
**Komentarze w kodzie:** **po angielsku** (zgodnie z guidelines sekcja 8)

---

## Status projektu (2026-05-19, koniec sesji 2 — atomy UI gotowe, user chce dopracować buttony)

| Etap | Stan |
|---|---|
| Faza 0 — decyzje strategiczne | ✅ zamknięta |
| Etap 0.1 — setup monorepo + Docker + GitHub | ✅ zamknięty |
| **Faza 1 — backend Medusy (brief #1)** | ✅ **ZAKOŃCZONA** |
| **Faza 2 — Admin UI (brief #2)** | ✅ **ZAKOŃCZONA** |
| **Faza 3 — Frontend Next.js (brief #3 gotowy)** | ⏳ **TERAZ — 2/31 iteracji** |
| Faza 4 — Integracje (płatności, kurier, faktury) | 🔒 |
| Faza 5 — Content, SEO, launch | 🔒 |
| Faza 6 — V1 (priorytet 1: B2B portal z progami rabatowymi) | 🔒 |

**Faza 3 — postęp:**
| # | Iteracja | Commit | Stan |
|---|---|---|---|
| 0 | setup-poland-region.ts (backend prep: EUR→PLN, country PL, tax VAT 23%) | `6519728` | ✅ |
| 1 | Setup apps/storefront — Next.js 15.1 + Tailwind + TS strict + path alias | `5abf552` | ✅ dev działa, build TODO §3G |
| 2 | Atomy UI (Button, Input, Label, Badge, Card, Container) + cn + lucide-react | `9598418` | ✅ showcase widoczny, type-check pass |
| **2.1** | **🔥 Dopracowanie buttonów (user feedback) — NASTĘPNA** | — | ⬜ |
| 3 | Stałe biznesowe + variant-wiring helper + Medusa client | — | ⬜ |
| 4 | Layout (Header + Footer + InfoBar) | — | ⬜ |
| 5-31 | Strona po stronie wg briefu §18 (Fazy 3B-3H) | — | ⬜ |

**🔥 NASTĘPNA SESJA — iteracja 2.1: dopracowanie buttonów**

User obejrzał showcase atomów (http://localhost:8000 w iteracji 2) i zgłosił że chce popracować nad przyciskami. Konkretny feedback do uzyskania w nowej sesji (kolory? rozmiary? rounded? hover effect? animacje? variants? — user zaznaczy z Figmy lub poda screenshot).

**Pierwszy prompt do CC w nowej sesji:**
> "Wracamy do buttonów. Otwórz `apps/storefront/src/components/ui/button.tsx` i pokaż mi aktualne variants. Potem zaproponuję zmiany — paleta z Figmy / inny rounded / hover lift / loading spinner / inne sizes."

Lokalizacja: `apps/storefront/src/components/ui/button.tsx` (~50 linii, CVA pattern z variants primary/secondary/ghost/danger/link × sizes sm/md/lg/icon). Wszystkie zmiany centralnie tam — Showcase w `src/app/page.tsx` automatycznie pokaże nowy look.

**Kamień milowy Fazy 1 osiągnięty:** `npx medusa exec ./src/scripts/test-workflows.ts` tworzy 3 produkty (Hak Skoda Octavia 3 z 5 wariantami, Bagażnik testowy z 1, Moduł uniwersalny z 1) widoczne w `/app`.

**Faza 2 — ✅ ZAKOŃCZONA, 15/15 iteracji** (`docs/briefs/admin-ui-brief.md`, raport: `docs/raports/RAPORT-FAZA-2.md`).

5 UI Routes w `src/admin/routes/`: `hooks`, `bike-racks`, `standalone-wiring`, `wiring-equipment`, `vehicles` (drzewo CRUD). 24 admin endpointy. 4 widgety na stronie produktu. 78 zautomatyzowanych asercji testowych PASSED. Manualny kamień milowy: wystawianie produktów przez UI w ~30s/produkt.

**Decyzje techniczne Fazy 2 (uzupełniające §26 guidelines):**
- **§26.11 (nowy quirk):** Workflow SDK serializuje `MedusaError` do plain object z `__isMedusaError: true` — `mapPublishError` w `src/api/admin/catalog/_helpers.ts` wykrywa obie formy
- UI Routes używają REST API + `credentials: "include"` (brief sugerował `container.resolve` w loaderze, ale Medusa Admin = client-only SPA)
- `react-hook-form ^7.76.0` + `@hookform/resolvers ^3.10.0` dodane do deps (jedyne nowe paczki)
- `catalog-publish-button` jako sekcja w stronach edycji katalogów (brief §13 dopuszcza, lepsze UX niż osobny widget)

**Demo katalog (po Fazie 2, commit `8c72d40`):** 4 marki (Skoda, VW, Ford, BMW) + 4 haki opublikowane przez `src/scripts/seed-demo-hooks.ts`:
- W/200 Westfalia → VW Golf 7 (650-1050 PLN, 5y gwarancji)
- B/305 Brink → Ford Focus 3 Kombi (550-950 PLN)
- S/410 Steinhof → BMW F30 (1280-1680 PLN, kula automatyczna)
- A/115 Auto-Hak → Skoda Octavia 3 (380-720 PLN)

Każdy z 5 wariantami (BARE/W7/W13/M7/M13), inventory 10 szt/wariant. Plus 3 testowe produkty z initial seed (status `draft`) + 4 sample Medusy (status `published`). Łącznie 11 produktów w bazie.

**Faza 3:** Frontend Next.js storefront. **Brief #3 v1.0 GOTOWY** w `docs/briefs/frontend-brief.md` (1242 linie, 31 iteracji w 8 podfazach 3A-3H, ~90h, 5-7 tygodni). Tech stack guidelines podbita do v1.4 (dodany §26.11 — workflow SDK serialized MedusaError).

**Stack Fazy 3 (z briefu §1):** Next.js 15 App Router + React 19 + TS strict + Tailwind + shadcn/ui + lucide-react + Framer Motion + TanStack Query + RHF + Zod + next/image + next/font.

**Workflow z Figmą (brief §0):** Figma dostępna pod fileKey `bFOpp42bkgVtsOlzH3CSbb`. User trzyma plik otwarty w desktopowej apce + zaznacza ramkę. CC używa MCP Figma `get_design_context` / `get_variable_defs` żeby pobrać kod + screenshot + tokeny.

**Stałe biznesowe (brief §3 → `lib/utils/constants.ts`):**
- PHONE: `+48 536 731 515`, LOCATION: `Lubichowo`
- `FREE_SHIPPING_THRESHOLD_PLN = 450`
- `AUTHORIZED_DISTRIBUTORS = ["Imioła Hak-Pol"]` (hardcoded, V1: tabela Manufacturer)
- `FEATURED_BRANDS`: Skoda, VW, Ford, Toyota, BMW, Audi, Renault, Opel (hardcoded top 8, V1: po analytics)

**Iteracja 1 (Faza 3A) — co stworzone w `apps/storefront/`:**
- `package.json` (workspace `@zahakowani/storefront`, Next 15.1.0 + React 19.0.0 exact)
- `tsconfig.json` (strict + noUncheckedIndexedAccess + path alias `@/*`)
- `tailwind.config.ts` z **placeholder** design tokens (Material Design 3 baseline — kolory primary indigo, secondary slate, accent amber). Podmień gdy będą tokeny z Figmy.
- `next.config.js` (env defaults, `images.remotePatterns` dla placehold.co)
- `.env.example` + `.env.local` (publishable key + region pl)
- `src/app/{layout.tsx, page.tsx, not-found.tsx}` + `src/styles/globals.css`
- ⚠️ `next/font/google` **wyłączony** (workaround prerendering bug — system fallback przez Tailwind `font-sans`)

**Iteracja 1 — ZNANY PROBLEM (do iteracji 28, Faza 3G Performance audit):**
- `npm run build` rzuca `"Cannot read properties of null (reading 'useContext')"` w `styled-jsx` podczas prerenderingu `/404`
- Przyczyna: **duplicate React w monorepo** — `apps/medusa` devDep React 18.3.1 (admin UI), `apps/storefront` React 19.0.0
- Naprawa: webpack alias w `next.config.js` lub `overrides` w root `package.json` wymuszające single React instance
- **Dev działa**, `npm run type-check` PASS, smoke testy HTTP 200/404 OK

**Następna iteracja 2 (po sygnale usera):**
- Atomy UI w `src/components/ui/`: Button, Input, Label, Badge, Card, Container (shadcn/ui copy-paste, nie npm install)
- `lucide-react` dodać do deps (ikony — kompatybilne API z Heroicons z Figmy)
- Variants buttonów: `primary | secondary | ghost | danger`, sizes: `sm | md | lg`
- Każdy atom z `cn()` helper (className merge — `clsx` + `tailwind-merge` w `lib/utils/cn.ts`)

**Pierwszy prompt do CC w nowej sesji (iteracja 2):**
> "Kontynuuj Fazę 3 iteracja 2 — atomy UI w `apps/storefront/src/components/ui/`. shadcn/ui style (copy-paste, nie npm install). Plus `lib/utils/cn.ts` z `clsx` + `tailwind-merge`. Test: import w `page.tsx` przykładowy Button żeby zobaczyć że działa."

**Decyzje wciąż OPEN (user, nie blokują startu):**
- Domena (`zahakowani.pl` czy nowa) → meta tagi i `canonical` URLs (decyzja przed Fazą 5)
- Design tokens z Figmy (kolory/typografia/spacing) → podmiana w `tailwind.config.ts`. Aktualnie placeholder Material Design 3.

---

## ⚠️ KRYTYCZNE — pułapki które już zostały wykryte i obejście

### 1. Port Postgres = **`55432`**, NIE 5432

Na hoście usera (Windows) jest natywny Postgres z innego projektu na porcie 5432. Docker container mapuje **`55432:5432`** żeby uniknąć kolizji. Connection string:

```
DATABASE_URL=postgres://zahakowani:zahakowani_dev@localhost:55432/zahakowani
```

Jeśli zobaczysz `KnexTimeoutError: SELECT 1` przy `medusa db:migrate` — to znak że Medusa próbuje uderzyć w 5432 zamiast 55432. Sprawdź `.env` w `apps/medusa/`.

### 2. `.npmrc` z `legacy-peer-deps=true` — wymagane

W korzeniu jest `.npmrc` z `legacy-peer-deps=true`. **Nie usuwaj.** Medusa 2.15.2 ma peer dep konflikt `@medusajs/icons` → `@medusajs/draft-order`. Bez tej flagi `npm install` odmawia.

### 3. `redisUrl not found. A fake redis instance will be used.` — to OK na dev

Medusa loguje ten warning bo Redis trzeba włączyć jako konkretne moduły w `medusa-config.ts` (`@medusajs/event-bus-redis`, `@medusajs/cache-redis`, `@medusajs/workflow-engine-redis`). W development używa fake/in-memory i to jest OK. **Włączymy Redis prod-style przed Fazą 4 lub 5 (deployment)** — nie ruszaj tego wcześniej.

### 4. `create-medusa-app` robi turbo wrapper

Jeśli będziesz inicjalizować nowy projekt Medusy — CLI tworzy `apps/<name>/apps/backend/` (mini-monorepo turbo). Wypłaszczamy ręcznie: `mv apps/<name>/apps/backend apps/<name>-tmp && rm -rf apps/<name> && mv apps/<name>-tmp apps/<name>`.

---

## Pierwsze uruchomienie po zalogowaniu (jeśli komputer był wyłączony)

```powershell
# 1. Sprawdź czy Docker Desktop działa (ikonka w trayu)
docker info  # powinno wypisać Server: Docker Desktop

# 2. Wystartuj Postgres + Redis (w korzeniu projektu)
cd E:\zahakowani-medusa
npm run docker:up

# 3. Sprawdź że oba kontenery są healthy
npm run docker:ps
# czekaj aż status pokaże "Up X seconds (healthy)" dla obu

# 4. Backend Medusy
cd apps\medusa
npm run dev
# Server is ready on port: 9000
# Admin URL → http://localhost:9000/app
```

**Admin user (dev only):** `admin@zahakowani.pl` / `admin123`

---

## Struktura repo

```
E:\zahakowani-medusa\
├── apps/
│   ├── medusa/                # @zahakowani/medusa — backend (Medusa v2.15.2)
│   │   ├── src/
│   │   │   ├── modules/       # Custom moduły domeny (tu idą rzeczy z briefu #1)
│   │   │   ├── links/         # Module Links
│   │   │   ├── workflows/     # Logika wieloetapowa
│   │   │   ├── api/           # Endpointy custom (admin/, store/)
│   │   │   ├── subscribers/
│   │   │   ├── jobs/
│   │   │   ├── admin/         # UI Routes & widgety (Faza 2)
│   │   │   └── migration-scripts/
│   │   ├── medusa-config.ts
│   │   ├── package.json
│   │   ├── .env               # NIE COMMITUJ
│   │   └── .env.template
│   ├── storefront/            # puste, Next.js 15 (Faza 3)
│   └── studio/                # puste, Sanity (Faza 5)
├── packages/
│   └── types/                 # puste, współdzielone typy TS (Faza 3+)
├── docs/
│   ├── tech-stack-guidelines.md   # ⭐ STAŁY KONTEKST — przeczytaj
│   ├── roadmapa.md                # plan w czasie
│   ├── plan-dzialania.md          # strategia, decyzje
│   └── briefs/
│       └── medusa-brief.md        # ⭐ brief #1 — Faza 1 (TERAZ)
├── docker-compose.yml         # Postgres 16 + Redis 7
├── package.json               # workspace root (npm workspaces, Node 20+)
├── .npmrc                     # legacy-peer-deps=true
├── .env.example
└── README.md
```

---

## Konwencje pracy (z guidelines, najczęściej naruszane)

**Pełna referencja:** `docs/tech-stack-guidelines.md` v1.2 (851 linii). Tutaj tylko ekstrakt rzeczy łatwych do złamania:

### Nazewnictwo
- Pliki / foldery / endpointy: `kebab-case` (`hook-catalog.service.ts`, `/store/by-vehicle/:id`)
- Moduły Medusy + tabele DB: `snake_case` (`hook_catalog`, `vehicle_fitment_generation`)
- Klasy / typy: `PascalCase` (`Hook`, `HookCatalogService`, `CreateHookInput`)
- Funkcje / zmienne: `camelCase` (`generateSku()`, `hookId`)
- Stałe globalne: `UPPER_SNAKE_CASE`

### Code style
- **TypeScript strict** + `noUncheckedIndexedAccess` + `noImplicitOverride`. **Zero `any`** — używaj `unknown` + type guards.
- **Service Layer Pattern** — logika biznesowa w serwisach modułu, NIE w endpointach.
- **Zod = jedyne źródło prawdy** dla typów: schema + `z.infer<typeof schema>`.
- **Brak `console.log`** poza `src/scripts/` — używaj loggera Medusy (Pino).
- **Komentarze w kodzie po angielsku.** Tylko **DLACZEGO**, nie **CO**.
- **Workflow Medusy z `compensate`** dla każdej operacji modyfikującej wiele encji.

### Git
- Branch: `feature/faza-X-opis` (np. `feature/faza-1-vehicle-fitment`)
- Commit messages **po polsku** z prefiksem `[FAZA-X]` lub `[ETAP-X]`. Każdy logiczny krok = osobny commit. Merge do `main` przez PR (chyba że solo dev = bezpośredni push, ale wciąż małymi krokami).
- Migracje **TYLKO** przez `npx medusa db:generate`. Nie pisz SQL ręcznie. Nie modyfikuj uruchomionych migracji — twórz nowe.

### Czego NIE robić
- **Zero testów do launchu** (MVP — brief explicit). Nie pisz testów nawet jeśli "byłoby dobrze".
- **Nie instaluj paczek** bez potrzeby — sprawdź czy Medusa już tego nie ma.
- **Nie hardkoduj** danych testowych w produkcyjnym kodzie — seedy w migracjach lub `src/scripts/`.
- **Nie nadpisuj** konwencji Medusy bez wyraźnego powodu (jeśli musisz — komentarz w commicie).

---

## Workflow pracy z userem (PRZECZYTAJ — łatwo zepsuć)

### Iteracyjnie: jedna sekcja briefu = jedna iteracja

**Guidelines sekcja 27** mówi explicite: nie zaimplementowuj całego briefu naraz. CC gubi kontekst, miesza konwencje, "optymalizuje" rzeczy które miały być proste. **Brief #1 ma 17 sekcji → rozbija się na ~13 iteracji** (lista w `docs/roadmapa.md`).

Po każdej iteracji: test → commit → następna. Jeden brief + ten plik (auto-ładowany) + `docs/tech-stack-guidelines.md` jako kontekst — nic więcej.

### Styl komunikacji z userem

- **Język:** polski (user pisze po PL).
- **Krok po kroku.** User uczy się Medusy i Next — ex-WooCommerce dev (PHP). Komendy CLI nie są dla niego oczywiste.
- **Przy każdej weryfikacji którą user ma zrobić:** podaj (1) dokładną komendę gotową do skopiowania, (2) co ta komenda robi prostym językiem, (3) czego się spodziewać po sukcesie, (4) co zrobić jak nie zadziała.
- **Autonomia w ramach planu:** user wprost powiedział "działaj śmiało, nie pytaj o pozwolenie" w ramach ustalonej roadmapy. Pisz kod, testuj sam, commituj, push — bez pytania "czy mogę". Raportuj wyniki na końcu iteracji.
- **Wciąż pytaj** gdy: wykraczasz poza plan, decyzja ma długoterminowe konsekwencje biznesowe (wybór biblioteki, zmiana architektury), destruktywna operacja, wydatek pieniędzy.

### Decyduj samodzielnie gdy brief nie precyzuje

Guidelines sekcja 12: jeśli brief vs konwencja Medusy → idź za Medusą + zostaw komentarz w commit message. Nie blokuj się na pytaniach.

---

## Co JUŻ zrobione (nie powtarzaj)

Etap 0.1 zamknięty w 3 commitach. Aktualny stan repo:

- ✅ `package.json` (workspace root, npm workspaces, Node 20+)
- ✅ `docker-compose.yml` (Postgres 16 + Redis 7 z healthcheckami, wolumeny)
- ✅ `.env.example` / `.gitignore` / `README.md` / `.npmrc`
- ✅ `apps/medusa/` — Medusa v2.15.2 zainicjalizowana, nazwa paczki `@zahakowani/medusa`, `private: true`
- ✅ Migracje + Medusa default seed (regions, sample products) wykonane lokalnie na bazie `zahakowani`
- ✅ Admin user `admin@zahakowani.pl` / `admin123` (dev)
- ✅ Wszystkie 4 dokumenty w `docs/`
- ✅ Backend testowany: `Server is ready on port 9000`, `/health` 200, `/app` renderuje admin

---

## Faza 1 — 13 iteracji zamkniętych

| # | Iteracja | Pliki | Commit |
|---|---|---|---|
| 1 | `vehicle_fitment` (Brand/VehicleModel/Generation + helpery) | `src/modules/vehicle-fitment/` | `3a49a75` |
| 2 | `hook_catalog` (Hook, 18 pól) | `src/modules/hook-catalog/` | `90dec58` |
| 3 | `wiring_equipment` + seed 4 rekordów (W7/W13/M7/M13) | `src/modules/wiring-equipment/`, `src/migration-scripts/seed-wiring-equipment.ts` | `871aee0` |
| 4 | `bike_rack_catalog` (BikeRack, 20 pól) | `src/modules/bike-rack-catalog/` | `7c1a09a` |
| 5 | `standalone_wiring_catalog` (z `fits_all_vehicles`) | `src/modules/standalone-wiring-catalog/` | `e48b1eb` |
| 6 | 5 Module Links | `src/links/` | `970fbad` |
| 7 | Shared utilities (4 generatory: title/variant/SKU/handle) | `src/utils/catalog/` | `bab0d55` |
| 8 | `createProductFromHook` workflow | `src/workflows/create-product-from-hook.ts` | `1aafa45` |
| 9 | `createProductFromBikeRack` + `createProductFromStandaloneWiring` | `src/workflows/create-product-from-{bike-rack,standalone-wiring}.ts` | `ef31044` |
| 10 | 5 endpointów vehicle-fitment + cross-category | `src/api/store/vehicle-fitment/`, `src/api/store/products/by-vehicle/` | `5d3bb82` |
| 11 | 6 endpointów listing + SEO landing | `src/api/store/categories/`, `src/api/store/landing/` | `295f7cc` |
| 12 | Indexy Postgres | (w modelach od iteracji 1-5 + auto na link tables) | — |
| 13 | Seed test catalog + `test-workflows.ts` (milestone) | `src/migration-scripts/seed-test-catalog-data.ts`, `src/scripts/test-workflows.ts` | `6b0f51a` |

**Decyzje techniczne podjęte w trakcie (warto wiedzieć dla Fazy 2):**

1. **SKU dla hooks zawiera generation code** (`{catalog}-{generation_code}-{variant_code}`, np. `Z/016-octavia-3-M13`) — Medusa wymusza globalny `UNIQUE` na `product_variant.sku`, bez generation code SKU duplikowały się gdy Hook fituje wiele generacji. To **rozszerzenie** brief §8.

2. **`pin_count` jako `number`, `power_socket`/`type` jako `text` zamiast `enum`** — GraphQL enum values muszą być valid identifiers (a `"7-pin"` / `"7"` nie są). Walidacja allowed values pójdzie do Zod na endpointach (Faza 2).

3. **`weight_kg` jako integer** (Medusa `model.number()` → PG `integer`). W seed wiring_equipment 1.5kg zaokrąglone do 2. Refactor na `model.bigNumber()` lub numeric column dopiero gdy precyzja decimal okaże się prod-critical.

4. **ProductVariant↔WiringEquipment NIE jest realnym Module Link** w Medusa 2.15.2 — `link.create` rzuca `"Cannot create multiple links between 'product' and 'wiring_equipment'"` (Medusa nie rozróżnia Product vs ProductVariant w `product` service przy multi-record batch). Workaround: `wiring_equipment_id` + `wiring_equipment_code` zapisywane w `variant.metadata`. Plik `src/links/variant-wiring-equipment.ts` zostawiony (tabela link istnieje), gotowy do wpięcia gdy Medusa naprawi quirk lub przy upgrade v2.16+.

5. **M:N Module Link wymaga `isList: true` na OBU stronach `defineLink`** — bez tego `product.generations` działa, ale `generation.products` rzuca `"Entity 'Generation' does not have property 'products'"`. Naprawione w `src/links/product-generation.ts`.

6. **`query.graph` z głębokimi nested links przez products** (np. `brand.models.generations.products.id`) rzuca `"Cannot read properties of undefined (reading 'strategy')"`. Workaround: rozdzielić na 2 query (entity-level + generation-level z `.products`) i agregować w JS.

7. **Filtr `products` po linkowanej encji** (np. `filters: { generations: { id }}`) nie działa w 2.15.2. Workaround: query od strony Generation (lub odpowiedniej encji link-source) i pobranie products po liście ID.

## Co dalej

Faza 2 (Admin UI) — czekamy na **brief #2** od usera. Po jego wrzuceniu do `docs/briefs/admin-ui-brief.md`, kontynuujemy iteracyjnie sekcję po sekcji.

---

## Notatka osobista o userze (krótko)

- PL, ex-WooCommerce dev (PHP), uczy się Medusy + Next + Dockera
- Preferuje krok-po-kroku, woli wgląd przez VS Code (otwiera repo równolegle do sesji CC w terminalu)
- Wcześniej miał projekt `E:\zahakowani-v2` (split na backend + storefront) — porzucony, świeży start od zera w tym repo
- Sklep `zahakowani.pl` żyje na starym WooCommerce/Bedrock, generuje znikomy obrót — Allegro to main channel (~1 mln zł/rok). Sklep własny budujemy żeby wyjść spod prowizji Allegro i zbudować markę.
- Komputer: Windows 11 Pro, Docker Desktop 29+, Node 20+, PowerShell 5.1 (Bash też dostępny przez Git Bash). Lokalny Postgres na 5432 z innego projektu (stąd 55432 dla nas).

---

## Gdy zacząłeś nową sesję i nie wiesz od czego

1. Przeczytaj `docs/tech-stack-guidelines.md` (jeśli go nie ładujesz przez auto memory)
2. Przeczytaj `docs/roadmapa.md` żeby zobaczyć status faz
3. Sprawdź ostatnie commity: `git log --oneline -10`
4. Sprawdź czy Docker działa i kontenery wstają: `npm run docker:up && npm run docker:ps`
5. Sprawdź że Medusa odpala: `cd apps/medusa && npm run dev` (curl `/health` w drugim terminalu)
6. Spytaj usera od której iteracji startujemy (lub potwierdź następną z roadmapy)
