# Zahakowani — roadmapa realizacji (v1.3, 2026-05-19)

Plan krok po kroku od dziś do działającego sklepu. Każde zadanie ma status:

- ✅ **gotowe** — zrobione, zamknięte
- ⏳ **w trakcie** — pracujemy, oczekuje na input
- ⬜ **do zrobienia** — czeka, ale nie blokuje
- 🔒 **zablokowane** — czeka na konkretną decyzję / inny task

---

## Stan obecny (2026-05-19)

**Faza 0 — Decyzje przed startem:** ✅ **ZAMKNIĘTA**

**Etap 0.1 — Setup repo + środowisko deweloperskie (monorepo):** ✅ **ZAMKNIĘTY** (repo na GitHub: wdabek85/zahakowani-medusa, Docker Postgres+Redis na porcie 55432, Medusa v2.15.2 zainicjalizowana)

**Faza 1 — Backend Medusy:** ✅ **ZAKOŃCZONA** — 13 iteracji, raport: `docs/raports/RAPORT-FAZA-1.md`
- 5 modułów domeny: vehicle_fitment, hook_catalog, wiring_equipment, bike_rack_catalog, standalone_wiring_catalog
- 5 Module Links + 3 workflowy z compensate (createProductFromHook/BikeRack/StandaloneWiring)
- 11 endpointów Store API (vehicle-fitment + by-vehicle + listings + SEO landing pages)
- 4 helpery w `utils/catalog/` (generateProductTitle/SKU/handle/years-label)
- Seedy: 4 WiringEquipment (W7/W13/M7/M13) + Skoda Octavia 3 + 3 test catalog items

**Faza 2 — Admin UI:** ✅ **ZAKOŃCZONA** — 15 iteracji, raport: `docs/raports/RAPORT-FAZA-2.md`
- 24 admin endpointy (CRUD per kategoria + publish-* + autocomplete + vehicle-fitment tree)
- 5 UI Routes w `src/admin/routes/`: hooks, bike-racks, standalone-wiring, wiring-equipment, vehicles (drzewo CRUD)
- 4 widgety na stronie produktu (catalog info per kategoria + fitment info)
- 8 walidatorów Zod, **78 zautomatyzowanych asercji testowych PASSED**
- Kamień milowy osiągnięty: wystawianie produktów przez UI w ~30s/produkt
- **Demo katalog:** 4 haki dla 4 marek wystawione przez `src/scripts/seed-demo-hooks.ts` (Westfalia W/200 dla VW Golf 7, Brink B/305 dla Ford Focus 3, Steinhof S/410 dla BMW F30, Auto-Hak A/115 dla Skoda Octavia 3) — status `published`, 5 wariantów każdy, ceny rynkowe PLN

**Faza 3 — Frontend Next.js MVP:** ⏳ **TERAZ** — brief #3 (`zahakowani-frontend-brief.md`) w pisaniu w Claude w claude.ai na podstawie `RAPORT-FAZA-2.md` + `plan-dzialania.md` §4 + `tech-stack-guidelines.md` §§16-25. Po dostarczeniu briefu CC zaczyna iteracyjnie (sekcja-po-sekcji wg guidelines §28).

**Repo:** 35 commitów na `main`. Ostatni `8c72d40` ([CHORE] seed-demo-hooks).

---

## Przegląd faz

| Etap | Co | Stan | Czas | Kamień milowy |
|---|---|---|---|---|
| **0** | Decyzje przed startem | ✅ | zamknięta | Wszystkie decyzje podjęte |
| **0.1** | Setup monorepo + Docker + GitHub | ✅ | zrobione | Repo + Docker działa |
| **1** | Backend Medusy — schema i workflow | ✅ | zrobione (13 iteracji) | `test-workflows.ts` tworzy 3 produkty z wariantami |
| **2** | Admin UI — wystawianie produktów | ✅ | zrobione (15 iteracji, 78 asercji PASSED) | Wystawianie przez panel w ~30s + 4 demo haki w bazie |
| **3** | **Frontend Next.js MVP** | ⏳ **TERAZ** | 4-6 tyg | Sklep przeklikany od listy do koszyka |
| **4** | Integracje (płatności, kurier, faktury, email) | 🔒 | 2-3 tyg | Pełna transakcja testowa z fakturą |
| **5** | Content + SEO + Launch | 🔒 | 2-3 tyg | Sklep żyje publicznie |
| **6** | V1 — analityka, opinie, growth | 🔒 | non-stop po launchu | — |

**Pozostało do launchu:** ~3-4 mies. (Fazy 3, 4, 5) przy 20-25 h/tydzień solo.

---

## Spis dokumentów projektu

| Dokument | Rola | Status |
|---|---|---|
| `zahakowani-roadmapa.md` | **ten** — plan w czasie | ✅ aktualny |
| `zahakowani-plan-dzialania.md` | strategia, struktura serwisu, zakres MVP | ✅ aktualny |
| `zahakowani-tech-stack-guidelines.md` | **stały kontekst dla CC — stack, konwencje, jak budować** | ✅ **v1.0 gotowy** |
| `zahakowani-medusa-brief.md` | techniczna spec modeli Medusy | ✅ **v2.1 — gotowy do Claude Code (z seedami + skryptem)** |
| `zahakowani-admin-ui-brief.md` | techniczna spec admin UI | ✅ napisany + zrealizowany (Faza 2 zakończona) |
| `zahakowani-frontend-brief.md` | techniczna spec frontu Next.js | ⏳ w pisaniu (Faza 3 — TERAZ) |
| `zahakowani-raport-faza-1.md` | raport końcowy Fazy 1 | ✅ w `docs/raports/RAPORT-FAZA-1.md` |
| `zahakowani-raport-faza-2.md` | raport końcowy Fazy 2 | ✅ w `docs/raports/RAPORT-FAZA-2.md` |

---

## Faza 0 — Decyzje przed startem ✅ ZAMKNIĘTA

| Decyzja | Stan | Wartość |
|---|---|---|
| Stack | ✅ | Medusa v2 + Next.js |
| 3 kategorie produktowe | ✅ | Haki, bagażniki rowerowe, wiązki/moduły standalone |
| Sekwencja kategorii | ✅ | Wszystkie 3 w Fazie 1 (haki jako wzorzec) |
| Marketplace wariant | ✅ | A — jeden sprzedawca, multi-category |
| Karta produktu | ✅ | Jeden uniwersalny szablon, różne parametry per kategoria |
| Filtry | ✅ | Ręcznie definiowane per kategoria w kodzie |
| Wyszukiwarka po pojeździe | ✅ | Cross-category, osobny endpoint, landing pages SEO |
| Pola sztywne / dynamiczne | ✅ | Sztywne w schemie (dodawanie nowych w kodzie, ~raz na pół roku) |
| Cena per wariant | ✅ | Ręcznie, nie wyliczana automatycznie |
| SKU per wariant | ✅ | Własny unikalny dla każdego wariantu |
| `fits_all_vehicles` flaga | ✅ | Tak — dla uniwersalnych z przyciskiem "Zaznacz wszystkie" |
| Parametry kategorii 1 (haki) | ✅ | Pełna lista w briefie + tabeli |
| Parametry kategorii 2 (bagażniki) | ✅ | 10 parametrów (liczba rowerów, ładowność, składany itd.) |
| Parametry kategorii 3 (wiązki) | ✅ | Te same co WiringEquipment + link do VehicleFitment + flaga uniwersalna |
| Hosting Medusy | ✅ (chwilowo) | Lokalnie, decyzja przed Fazą 5 |
| Płatności | ✅ | Macie założone, podłączenie w Fazie 4 |
| Opinie | ✅ | TrustedShops w Fazie 6 |
| Analityka | ✅ | GTag w Fazie 6 |
| CMS | ✅ | **Sanity** |
| Design system | ✅ | **Material Design w Figmie, kompletny** |

---

## Etap 0.1 — Setup repo + środowisko deweloperskie ✅ ZAMKNIĘTY

**Cel:** monorepo na GitHubie + lokalne środowisko Docker + projekt Medusy zainicjalizowany. Klonujesz repo na obu maszynach (stacjonarce i macbooku) i wszystko działa identycznie.

### Decyzje strukturalne (zamknięte)

| Decyzja | Wartość |
|---|---|
| Repo | **Monorepo** — jedno repo `zahakowani` |
| Hosting kodu | **GitHub (prywatne)** |
| Manager paczek | **npm workspaces** |
| Lokalna baza | **Docker Compose** — Postgres 16 + Redis |
| Główna maszyna | **Stacjonarka** (zaczynasz tu) |
| Druga maszyna | **MacBook** (synchronizacja przez git) |

### Struktura monorepo

```
zahakowani/
├── package.json              # workspace root
├── docker-compose.yml        # Postgres + Redis
├── .env.example
├── .gitignore
├── README.md                 # instrukcja uruchomienia
│
├── apps/
│   ├── medusa/               # backend Medusy (Faza 1+)
│   ├── storefront/           # Next.js frontend (Faza 3)
│   └── studio/               # Sanity Studio (Faza 5)
│
├── packages/
│   └── types/                # współdzielone typy (Faza 3+)
│
└── docs/                     # dokumentacja projektu
    ├── plan-dzialania.md
    ├── roadmapa.md
    ├── tech-stack-guidelines.md
    └── briefs/
        ├── medusa-brief.md
        ├── admin-ui-brief.md
        └── frontend-brief.md
```

### Zadania

| # | Zadanie | Wykonawca | Status |
|---|---|---|---|
| 0.1.1 | Instalacja Docker Desktop na stacjonarce | Ty | ⬜ |
| 0.1.2 | Założenie prywatnego repo `zahakowani` na GitHubie (bez README/gitignore/license) | Ty | ⬜ |
| 0.1.3 | Klonowanie repo lokalnie (`~/projekty/zahakowani/` lub gdzie wolisz) | Ty | ⬜ |
| 0.1.4 | Otwarcie Claude Code w katalogu projektu | Ty | ⬜ |
| 0.1.5 | CC: Setup workspace root + `docker-compose.yml` z Postgres 16 + Redis | CC | ⬜ |
| 0.1.6 | CC: Setup `.env.example` z listą zmiennych | CC | ⬜ |
| 0.1.7 | CC: Setup `.gitignore` + `README.md` z instrukcją uruchomienia | CC | ⬜ |
| 0.1.8 | CC: Inicjalizacja `apps/medusa/` — pusty projekt Medusy v2 | CC | ⬜ |
| 0.1.9 | Wrzucenie dokumentów do `docs/` (te 4 markdowny) | Ty | ⬜ |
| 0.1.10 | Test: `docker compose up -d` + `cd apps/medusa && npm run dev` — backend leci na :9000 | Ty | ⬜ |
| 0.1.11 | Pierwszy commit + push do GitHuba | Ty | ⬜ |
| 0.1.12 | Instalacja Docker Desktop na macbooku | Ty | ⬜ |
| 0.1.13 | Klonowanie repo na macbooku + powtórzenie kroku 0.1.10 | Ty | ⬜ |

### Co Claude Code potrzebuje żeby zacząć etap 0.1

| Wymagane | Status |
|---|---|
| Konto GitHub | ✅ |
| Repo `zahakowani` utworzone (puste) | ⬜ |
| Repo sklonowane lokalnie | ⬜ |
| Docker Desktop zainstalowany na stacjonarce | ⬜ |
| Claude Code otwarty w katalogu projektu | ⬜ |
| `tech-stack-guidelines.md` jako kontekst dla CC | ✅ (mamy plik) |

### Polecenie dla Claude Code (po krokach 0.1.1 – 0.1.4)

> "Zainicjalizuj monorepo dla projektu zahakowani według struktury z `tech-stack-guidelines.md` sekcja 2. Setup:
> - workspace root z npm workspaces
> - `docker-compose.yml` z Postgres 16 i Redis
> - `.env.example` z wymaganymi zmiennymi
> - `.gitignore` + `README.md` z instrukcją uruchomienia
> - `apps/medusa/` jako pusty projekt Medusy v2 (template Medusy)
> - Foldery `apps/storefront/`, `apps/studio/`, `packages/types/`, `docs/`, `docs/briefs/` jako puste z `.gitkeep`"

### Kamień milowy etapu 0.1

`git pull` na macbooku + `docker compose up -d` + `npm run dev` w `apps/medusa` → backend Medusy odpala się na obu maszynach identycznie.

Po tym: wchodzisz w Fazę 1.

---

## Faza 1 — Backend Medusy ✅ ZAKOŃCZONA

Patrz `docs/raports/RAPORT-FAZA-1.md` — pełny raport z 13 iteracji (1012 linii: pliki, modele, linki, workflowy, endpointy, seedy, testy, odstępstwa, problemy).

**W skrócie:** 5 modułów domeny + 5 Module Links + 3 workflowy z compensate + 11 endpointów Store API + helpery + seedy. `test-workflows.ts` przeszedł, w bazie są 4 demo haki (status `published`).

Historyczna treść poniżej zostawiona dla kontekstu:

---

### Faza 1 — szczegóły historyczne (zrealizowane)

**Cel:** schema gotowa, workflow działa, można wystawić produkty wszystkich 3 kategorii przez API.

### Co Claude Code potrzebuje żeby zacząć

| Wymagane | Status | Komentarz |
|---|---|---|
| Wszystkie decyzje z Fazy 0 | ✅ | Mamy |
| Projekt Medusy postawiony lokalnie | ✅ | Masz |
| Postgres skonfigurowany | ✅ | Masz |
| Brief #1 zaktualizowany | ✅ | v2.0 + seed WiringEquipment z testowymi wartościami |
| Lista pojazdów do seedu | ✅ | Nie potrzebna — wpisujesz ręcznie po Fazie 2 |
| Pierwszy testowy Hook | ✅ | Nie potrzebny — wystawisz testowo przez API w zadaniu 1.8 |

### Co zostało dorzucone do briefu #1 v2.0

| Poprawka | Status |
|---|---|
| Cena per wariant — ręcznie, nie wyliczana | ✅ |
| Każdy wariant ma własny SKU — explicite | ✅ |
| Helpery wyciągnięte do shared utility (`src/utils/catalog/`) | ✅ |
| Moduł `bike_rack_catalog` z 10 parametrami | ✅ |
| Moduł `standalone_wiring_catalog` z flagą `fits_all_vehicles` | ✅ |
| Endpoint cross-category vehicle search | ✅ |
| Indexy Postgres na linkach i fladze uniwersalnej | ✅ |
| Endpointy SEO landing pages | ✅ |
| Workflowy `createProductFromBikeRack` i `createProductFromStandaloneWiring` | ✅ |

### Zadania w fazie

| # | Zadanie | Status | Wykonawca |
|---|---|---|---|
| 1.1 | Aktualizacja briefu #1 do v2.0 | ✅ | Zrobione |
| 1.2 | Setup modułów `hook_catalog`, `wiring_equipment`, `vehicle_fitment` | ⬜ | Claude Code |
| 1.3 | Setup modułów `bike_rack_catalog`, `standalone_wiring_catalog` | ⬜ | Claude Code |
| 1.4 | Module Links | ⬜ | Claude Code |
| 1.5 | Workflowy `createProductFromHook`, `createProductFromBikeRack`, `createProductFromWiring` | ⬜ | Claude Code |
| 1.6 | Endpoint cross-category vehicle search | ⬜ | Claude Code |
| 1.7 | Seed 4 WiringEquipment + 1 Brand + 1 Model + 1 Generation + 1 Hook + 1 BikeRack + 1 StandaloneWiring w migracji (CC z briefu, wartości testowe) | ✅ | Specyfikacja w briefie |
| 1.8 | Skrypt testowy `src/scripts/test-workflows.ts` odpalający 3 workflowy z seedem | ✅ | Specyfikacja w briefie |
| 1.9 | Ty: `npx medusa db:migrate` + `npx medusa exec ./src/scripts/test-workflows.ts` + weryfikacja w `/app` że 3 produkty istnieją z wariantami | ⬜ | Po implementacji CC |

**Czas:** 2-3 tygodnie.

**Kamień milowy:** odpalasz `npx medusa exec ./src/scripts/test-workflows.ts` → w panelu Medusy widzisz 3 produkty (hak z 5 wariantami, bagażnik z 1 wariantem, wiązka uniwersalna z 1 wariantem). Schema multi-category potwierdzona, workflow działa.

---

## Faza 2 — Admin UI ✅ ZAKOŃCZONA

Patrz `docs/raports/RAPORT-FAZA-2.md` — pełny raport z 15 iteracji (24 endpointy, 5 UI Routes, 4 widgety, 8 walidatorów Zod, 78 asercji testowych).

**W skrócie:** wystawianie produktów przez UI w ~30s. Demo katalog: 4 marki (Skoda, VW, Ford, BMW) + 4 haki (Westfalia, Brink, Steinhof, Auto-Hak) wystawione przez `src/scripts/seed-demo-hooks.ts`, status `published`, 5 wariantów każdy.

Historyczna treść poniżej zostawiona dla kontekstu:

---

### Faza 2 — szczegóły historyczne (zrealizowane)

**Cel:** wystawianie produktów we wszystkich 3 kategoriach przez panel.

### Co Claude Code potrzebuje żeby zacząć

| Wymagane | Status |
|---|---|
| Faza 1 zakończona | 🔒 (zależy od Fazy 1) |
| **Brief #2 (admin UI) napisany** | ⬜ TODO przed startem CC |

### Zadania

| # | Zadanie | Status |
|---|---|---|
| 2.1 | Napisanie briefu #2 | ⬜ |
| 2.2 | UI Routes per kategoria (`/admin/hooks`, `/admin/bike-racks`, `/admin/standalone-wiring`, `/admin/vehicles`, `/admin/wiring-equipment`) | ⬜ |
| 2.3 | Formularze edycji per kategoria | ⬜ |
| 2.4 | Workflow trigger ("Wystaw produkt" modal) | ⬜ |
| 2.5 | Widgety na stronie Medusa Product | ⬜ |
| 2.6 | Komponent picker pojazdów (Brand→Model→Generation kaskadowo + "Zaznacz wszystkie") | ⬜ |
| 2.7 | Komponent autocomplete dla pól tekstowych (producent, homologacja, typ kuli) | ⬜ |
| 2.8 | Wystawienie 15 produktów testowych (5 × 3 kategorie) | ⬜ |

**Czas:** 2-3 tygodnie.

**Kamień milowy:** wystawiasz produkt w 30 sekund przez panel. 15 produktów testowych w bazie.

---

## Faza 3 — Frontend Next.js MVP ⏳ TERAZ

**Cel:** użytkownik może przeklikać sklep od strony głównej do koszyka.

### Co Claude Code potrzebuje żeby zacząć

| Wymagane | Status |
|---|---|
| Faza 2 zakończona | ✅ |
| **Brief #3 (frontend) napisany** | ⬜ |
| Branding + design system | ✅ **Material Design w Figmie, gotowy** |
| Domena | 🔒 do decyzji |

### Zadania

| # | Zadanie | Status |
|---|---|---|
| 3.1 | Napisanie briefu #3 | ⬜ |
| 3.2 | Setup Next.js + design system (Tailwind) + komponenty bazowe | ⬜ |
| 3.3 | Connection do Medusa API + customer auth | ⬜ |
| 3.4 | Strona główna + selektor pojazdu (USP) | ⬜ |
| 3.5 | Listingi kategorii + filtry per kategoria | ⬜ |
| 3.6 | Strony marek/modeli/generacji jako landing pages SEO | ⬜ |
| 3.7 | Strona produktu (uniwersalny szablon, dynamiczna tabela parametrów) | ⬜ |
| 3.8 | Strona wyników po pojeździe (cross-category) | ⬜ |
| 3.9 | Koszyk + checkout (bez płatności jeszcze) | ⬜ |
| 3.10 | Strony statyczne (regulamin, dostawa, kontakt, o nas) | ⬜ |
| 3.11 | SEO podstawowe (meta tags, structured data, sitemap, robots) | ⬜ |

**Czas:** 4-6 tygodni.

**Kamień milowy:** sklep przeklikany end-to-end. Bez płatności i kuriera, ale UX kompletny.

---

## Faza 4 — Integracje (płatności, kurier, faktury, email) ⬜

**Cel:** pełna transakcja testowa od kliknięcia "Kup" do paczki przy drzwiach.

### Co potrzeba zanim zaczniemy

| Wymagane | Status |
|---|---|
| Finalne PSP (już ustalone według ciebie) | ✅ |
| Wybór kuriera głównego | 🔒 |
| Wybór systemu faktur (Fakturownia/iFirma/Wfirma) | 🔒 |
| Wybór email transakcyjnego (Resend/Postmark/Brevo) | 🔒 |

### Zadania

| # | Zadanie | Status |
|---|---|---|
| 4.1 | Integracja PSP — sandbox + testy | ⬜ |
| 4.2 | Integracja InPost API (etykiety, tracking) | ⬜ |
| 4.3 | Integracja kuriera "drzwi-drzwi" (DPD/DHL) | ⬜ |
| 4.4 | Kalkulator kosztu wysyłki (waga, region, próg darmowej) | ⬜ |
| 4.5 | Integracja systemu faktur API | ⬜ |
| 4.6 | Email transakcyjny | ⬜ |
| 4.7 | Testy end-to-end (twoja karta → faktura w mailu → tracking) | ⬜ |

**Czas:** 2-3 tygodnie.

**Kamień milowy:** pełna transakcja testowa działa od początku do końca.

---

## Faza 5 — Content + SEO + Launch ⬜

**Cel:** sklep żyje publicznie, ma pierwszą zawartość, robi pierwsze sprzedaże.

### Co potrzeba

| Wymagane | Status |
|---|---|
| Wybór CMS | ✅ | **Sanity** |
| Plan contentu na pierwsze 3 miesiące | 🔒 |
| Hosting produkcyjny | 🔒 |

### Zadania

| # | Zadanie | Status |
|---|---|---|
| 5.1 | Setup CMS + integracja z Next.js | ⬜ |
| 5.2 | Pierwsze 5-10 poradników | ⬜ |
| 5.3 | Search Console + GA4 + GTM + Plausible | ⬜ |
| 5.4 | Struktura linkowania wewnętrznego (huby SEO per marka) | ⬜ |
| 5.5 | Soft launch (rodzina, znajomi, mała kampania FB Ads) | ⬜ |
| 5.6 | Full launch + Google Ads + pierwszy newsletter | ⬜ |

**Czas:** 2-3 tygodnie.

**Kamień milowy:** sklep żyje publicznie, pierwsze zewnętrzne sprzedaże.

---

## Faza 6 — Post-launch (V1) ⬜ NON-STOP

**Pierwszy priorytet po launch MVP (zaczynamy od razu, nie czekamy na popyt):**

- **B2B portal z progami rabatowymi miesięcznymi** — np. 0-20k zł → 5%, 20k+ → 10% (obrót netto = zakupy minus zwroty, reset 1. dnia miesiąca). Pełna pre-spec w historii czatu, do rozbudowy jako brief #4 gdy MVP zostanie zakończony.

**Pozostałe (kolejność do ustalenia po launch):**

- TrustedShops integracja
- Wishlist
- Stock alerts
- Cross-sell / related products
- Newsletter automatyzacje
- Filmy montażowe (YouTube)
- Live chat
- Google Merchant Center feed
- Eksport ofert Allegro ze sklepu
- Kolejne kategorie produktowe

---

## Twój następny ruch (TERAZ — 2026-05-19)

**Faza 3 (Frontend Next.js) — brief #3 w pisaniu w Claude w claude.ai.**

Po ukończeniu briefu wrzucasz go do `docs/briefs/frontend-brief.md`, otwierasz CC w katalogu projektu i mówisz "Faza 3, iteracja 1" — CC będzie wiedział co robić (CLAUDE.md + raporty Fazy 1/2 + guidelines v1.3 są w repo).

**Niezależnie od briefu, do podjęcia decyzja:**

1. **Domena** (`plan-dzialania.md` §7) — `zahakowani.pl` (cutover ze starego WP) czy nowa? Wpływa na meta tagi SEO i `canonical` URLs w `generateMetadata()` na każdej stronie.
2. **Eksport tokenów designu z Figmy** (kolory, typografia, spacing, breakpoints) → wpiszę do `apps/storefront/tailwind.config.ts`. Bez tego użyję placeholder z Material Design 3 defaults (do podmiany później).

**Backend do skorygowania przed Fazą 3** (CC może zrobić autonomicznie):

- Currency `EUR` (z templatki Medusy) → `PLN` dla regionu Polska
- Dodać region "Polska" + przypisać `pl` country + tax region VAT 23%
- Dodać 1 placeholder shipping option (faktyczne InPost/DPD/DHL w Fazie 4)

**Po dostarczeniu briefu #3 CC rusza z Fazą 3** zgodnie z guidelines §28 — sekcja-po-sekcji, test po każdej iteracji, commit `[FAZA-3] iteracja X: opis`.

---

## Reguły higieny przez cały projekt

1. Każdy tydzień ma kamień milowy
2. Każda decyzja idzie do `plan-dzialania.md` (sekcja 7) zanim się ją zaimplementuje
3. Brak scope creep — każda "a może by tak..." → notuj jako out-of-scope, ocena przy kolejnym przeglądzie
4. Co 2 tygodnie przegląd roadmapy
5. Backupy bazy codzienne od pierwszego deployu produkcyjnego
6. Każdy launch → najpierw staging

---

**Wersja:** 1.2  
**Następny przegląd:** po zakończeniu etapu 0.1
