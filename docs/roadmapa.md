# Zahakowani — roadmapa realizacji (v1.4)

Plan krok po kroku od dziś do działającego sklepu. Każde zadanie ma status:

- ✅ **gotowe** — zrobione, zamknięte
- ⏳ **w trakcie** — pracujemy, oczekuje na input
- ⬜ **do zrobienia** — czeka, ale nie blokuje
- 🔒 **zablokowane** — czeka na konkretną decyzję / inny task

---

## Stan obecny

**Faza 0 — Decyzje przed startem:** ✅ **ZAMKNIĘTA**

**Etap 0.1 — Setup repo + środowisko deweloperskie (monorepo):** ✅ **ZAMKNIĘTY**

**Faza 1 — Backend Medusy:** ✅ **ZAMKNIĘTA (2026-05-16)**

**Faza 2 — Admin UI:** ✅ **ZAMKNIĘTA (2026-05-16)**

Wszystkie 5 produktów testowych wystawione przez UI panelu w ~30s na produkt. 78 zautomatyzowanych asercji passed. 14 commitów `[FAZA-2]`. Pełen raport: `zahakowani-raport-faza-2.md`. Wykryto nowy quirk Medusy 2.15.2 (§26.11 — workflow SDK serializuje MedusaError do plain object).

**Faza 3 — Frontend Next.js MVP:** ⏳ **GOTOWA DO STARTU — brief #3 v1.0 gotowy do Claude Code, 31 iteracji rozpisane**

Seed katalogu: ✅ wykonany — 4 haki opublikowane (commit `8c72d40`, `src/scripts/seed-demo-hooks.ts`): Westfalia W/200 dla VW Golf 7, Brink B/305 dla Ford Focus 3, Steinhof S/410 dla BMW F30, Auto-Hak A/115 dla Skoda Octavia 3. Każdy z 5 wariantami i inventory 10 szt — front ma materiał do testowania layoutu, listingu i strony produktu.

---

## Przegląd faz

| Etap | Co | Czas | Kamień milowy |
|---|---|---|---|
| **0** | Decyzje przed startem | ✅ zamknięta | Wszystkie decyzje podjęte |
| **0.1** | Setup monorepo + Docker + GitHub | 1-2 dni | Klonujesz repo na drugiej maszynie i wszystko odpala |
| **1** | Backend Medusy — schema i workflow | 2-3 tyg | Skrypt testowy tworzy 3 produkty z wariantami |
| **2** | Admin UI — wystawianie produktów | 2-3 tyg | Wystawiasz produkt w 30s przez panel |
| **3** | Frontend Next.js MVP | 4-6 tyg | Sklep przeklikany od listy do koszyka |
| **4** | Integracje (płatności, kurier, faktury, email) | 2-3 tyg | Pełna transakcja testowa z fakturą |
| **5** | Content + SEO + Launch | 2-3 tyg | Sklep żyje publicznie |
| **6** | V1 — analityka, opinie, growth | non-stop po launchu | — |

**Razem do launchu:** ~4-5 miesięcy przy 20-25 h/tydzień solo.

---

## Spis dokumentów projektu

| Dokument | Rola | Status |
|---|---|---|
| `zahakowani-roadmapa.md` | **ten** — plan w czasie | ✅ aktualny (v1.4) |
| `zahakowani-plan-dzialania.md` | strategia, struktura serwisu, zakres MVP | ✅ aktualny |
| `zahakowani-tech-stack-guidelines.md` | **stały kontekst dla CC — stack, konwencje, jak budować** | ✅ v1.4 + quirks Medusy z Faz 1 i 2 (§26.11 — workflow SDK serialized MedusaError) |
| `zahakowani-medusa-brief.md` | techniczna spec modeli Medusy (Faza 1) | ✅ v2.1 — zaimplementowany |
| `zahakowani-raport-faza-1.md` | raport końcowy Fazy 1 | ✅ gotowy |
| `zahakowani-admin-ui-brief.md` | techniczna spec admin UI (Faza 2) | ✅ v1.0 — zaimplementowany |
| `zahakowani-raport-faza-2.md` | **raport końcowy Fazy 2 — odstępstwa, nowy quirk, kontekst dla briefu #3** | ✅ **gotowy** |
| `zahakowani-frontend-brief.md` | techniczna spec frontend Next.js (Faza 3) | ✅ **v1.0 gotowy do CC, 31 iteracji** |

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

## Faza 1 — Backend Medusy ✅ ZAMKNIĘTA (2026-05-16)

**Cel zrealizowany:** schema gotowa, workflowy działają, można wystawić produkty wszystkich 3 kategorii przez API.

**Repo:** github.com/wdabek85/zahakowani-medusa
**Stack:** Medusa.js v2.15.2 + PostgreSQL 16 + Redis 7 + TypeScript strict

**Pełen raport:** `zahakowani-raport-faza-1.md`

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

### Zadania w fazie — WSZYSTKIE ZAMKNIĘTE ✅

| # | Zadanie | Status |
|---|---|---|
| 1.1 | Aktualizacja briefu #1 do v2.1 | ✅ |
| 1.2 | Moduły `hook_catalog`, `wiring_equipment`, `vehicle_fitment` | ✅ |
| 1.3 | Moduły `bike_rack_catalog`, `standalone_wiring_catalog` | ✅ |
| 1.4 | Module Links (5 sztuk — variant↔wiring jako metadata workaround) | ✅ |
| 1.5 | 3 workflowy z kompensacjami | ✅ |
| 1.6 | Endpointy cross-category vehicle search | ✅ |
| 1.7 | Seed: 4 WiringEquipment + 1 Brand + 1 Model + 1 Generation + 1 Hook + 1 BikeRack + 1 StandaloneWiring | ✅ |
| 1.8 | Skrypt `test-workflows.ts` + 9 dodatkowych test scripts | ✅ |
| 1.9 | Weryfikacja w `/app/products` — 3 produkty widoczne | ✅ |
| 1.10 | Raport końcowy `zahakowani-raport-faza-1.md` | ✅ |

**Kamień milowy osiągnięty:** `npx medusa exec ./src/scripts/test-workflows.ts` przechodzi end-to-end → 3 produkty draft w `/app/products` ze wszystkimi powiązaniami.

### Kluczowe odstępstwa i workaroundy (szczegóły w raporcie §10-11)

| Co | Workaround | Konsekwencja dla Fazy 2 |
|---|---|---|
| **Variant ↔ WiringEquipment link** — bug Medusy 2.15.2 | Dane w `variant.metadata` jako jsonb | Admin UI musi czytać `variant.metadata.wiring_equipment_id` zamiast `variant.wiring_equipment` |
| **SKU dla per-generation produktów** | Format: `{catalog_number}-{generation_code}-{variant_code}` zamiast `{catalog_number}-{variant_code}` | Brief #2 wpisuje rzeczywisty format |
| **Enum vs text** dla `pin_count`, `power_socket` | Pola jako `text()` (GraphQL enum constraints) | Zod walidacja allowed values w formularzach |
| **Single-variant produkty** | Mają dummy `ProductOption: Wariant=Standardowy` (wymóg Medusa core) | Admin UI ukrywa to pole / pokazuje jako "brak wariantów" |
| **Endpoint `models/:modelId/generations`** | używa `modelId`, nie `modelCode` | `lookup` endpoint zwraca ID, używaj go |
| **`weight_kg` jako integer** | 1.5 zaokrąglone do 2 | Inputy admin akceptują integer (refactor do decimal post-launch) |
| **Filtry zakresowe (`$gte`, `$lte`)** | Aplikowane w JS po pobraniu z DB | Działa OK do kilkuset produktów, optymalizacja przed launchem |

### Problemy zgłoszone do post-launch

- **Redis fallback do in-memory** — `medusa-config.ts` wymaga dorzucenia modułów Redis (event-bus, cache, workflow-engine) przed Fazą 4
- **Templatkowe endpointy** `/admin/custom` i `/store/custom` — do usunięcia w Fazie 2 przy clean-upie

---

## Faza 2 — Admin UI ✅ ZAMKNIĘTA (2026-05-16)

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

## Faza 3 — Frontend Next.js MVP ⏳ TERAZ — brief #3 gotowy, czeka na start CC

**Cel:** użytkownik może przeklikać sklep od strony głównej do koszyka.

### Co Claude Code potrzebuje żeby zacząć

| Wymagane | Status |
|---|---|
| Faza 2 zakończona | 🔒 |
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

## Twój następny ruch (TERAZ)

**Fazy 1 i 2 zamknięte** ✅. **Brief #3 (frontend) gotowy** ✅.

**Wrzucasz do Claude Code 4 dokumenty:**
1. `zahakowani-tech-stack-guidelines.md` v1.4 — stały kontekst (konwencje + 11 quirks Medusy z Faz 1 i 2 włącznie z §26.11)
2. `zahakowani-raport-faza-1.md` — co realnie powstało w backendzie
3. `zahakowani-raport-faza-2.md` — co realnie powstało w admin UI + quirk §26.11
4. `zahakowani-frontend-brief.md` v1.0 — spec frontu

**Plus:** masz **Figma otwartą w desktopowej apce Figma** podczas pracy. CC używa MCP Figma do pobierania design context per komponent. Każda iteracja pracuje na jednej sekcji Figmy.

**Pracujesz iteracyjnie strona po stronie, sekcja po sekcji** (zgodnie z `tech-stack-guidelines.md` sekcja 28 + sekcja 18 briefu #3). Brief ma rozpisane 31 iteracji.

**Pierwszy prompt do CC:**
> "Mam wgrane 4 dokumenty. Implementuj iterację 1 z sekcji 18 briefu #3: Setup `apps/storefront/` — Next.js 15 + Tailwind + TS strict + shadcn init. Tokeny tailwinda pobierz z Figmy przez MCP (mam plik otwarty, zaznaczyłem ramkę z tokenami). Tylko ta iteracja."

**Sekcja 18 briefu rozbiła Fazę 3 na 8 podfaz (3A-3H):**

| Podfaza | Co | Iteracje | Czas |
|---|---|---|---|
| 3A | Setup + fundament (Next.js, Tailwind, tokeny, atomy, layout) | 1-4 | 1-2 tyg |
| 3B | Strona główna (Hero, sekcje, composition) | 5-11 | 1-2 tyg |
| 3C | Listingi kategorii + filtry | 12-16 | 1 tydz |
| 3D | Wyszukiwanie po pojeździe | 17 | kilka dni |
| 3E | Strona produktu (galeria, warianty, parametry) | 18-21 | 1-2 tyg |
| 3F | Koszyk + checkout (drawer, strona, formularz, mock confirmation) | 22-25 | 1-2 tyg |
| 3G | Strony statyczne + SEO + performance | 26-28 | 1 tydz |
| 3H | Cleanup + raport końcowy | 29-31 | kilka dni |

**Razem:** ~90h pracy z CC rozłożone na 5-7 tygodni.

**Kamień milowy Fazy 3:** user przechodzi pełną ścieżkę zakupową end-to-end (home → wybór pojazdu → listing → produkt → wariant → koszyk → checkout → "zamówienie złożone"). Bez realnej płatności (mock), ale wszystko inne działa, SEO poprawne, Core Web Vitals zielone.

Po zakończeniu Fazy 3 wracasz z raportem (`zahakowani-raport-faza-3.md`) i piszemy razem brief #4 (integracje płatności + kurier + faktury + email).

---

## Reguły higieny przez cały projekt

1. Każdy tydzień ma kamień milowy
2. Każda decyzja idzie do `plan-dzialania.md` (sekcja 7) zanim się ją zaimplementuje
3. Brak scope creep — każda "a może by tak..." → notuj jako out-of-scope, ocena przy kolejnym przeglądzie
4. Co 2 tygodnie przegląd roadmapy
5. Backupy bazy codzienne od pierwszego deployu produkcyjnego
6. Każdy launch → najpierw staging

---

**Wersja:** 1.4  
**Następny przegląd:** po zakończeniu Fazy 3
