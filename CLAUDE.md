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

## Status projektu (na 2026-05-16)

| Etap | Stan |
|---|---|
| Faza 0 — decyzje strategiczne | ✅ zamknięta |
| **Etap 0.1 — setup monorepo + Docker + GitHub** | ✅ **zamknięty** |
| **Faza 1 — backend Medusy (brief #1)** | ⏳ **TERAZ — czeka na start iteracji 1** |
| Faza 2 — Admin UI (brief #2, nie napisany) | 🔒 |
| Faza 3 — Frontend Next.js (brief #3, nie napisany) | 🔒 |
| Faza 4 — Integracje (płatności, kurier, faktury) | 🔒 |
| Faza 5 — Content, SEO, launch | 🔒 |
| Faza 6 — V1 (priorytet 1: B2B portal z progami rabatowymi) | 🔒 |

**Następny krok:** Faza 1, iteracja 1 — moduł `vehicle_fitment` (Brand, VehicleModel, Generation). Patrz `docs/briefs/medusa-brief.md` sekcja 1.

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

## Co dalej — Faza 1, iteracja 1: moduł `vehicle_fitment`

**Plan:**
1. `src/modules/vehicle-fitment/` z modelami `Brand`, `VehicleModel`, `Generation` (pola w `docs/briefs/medusa-brief.md` §1)
2. Service `VehicleFitmentService` z metodami list / retrieve / getModelsByBrand / getGenerationsByModel
3. Pola wyliczane (helpery w serwisie): `years_label`, `full_name`, `url_slug`
4. Migracja przez `npx medusa db:generate vehicleFitment`
5. Test: `npx medusa db:migrate` przechodzi + utworzenie ręczne 1 Brand/Model/Generation przez `npx medusa exec` żeby sprawdzić schemę
6. Commit `[FAZA-1] modul vehicle_fitment: Brand, VehicleModel, Generation`

Po tym → iteracja 2 (moduł `hook_catalog`), zgodnie z `docs/roadmapa.md` Faza 1.

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
