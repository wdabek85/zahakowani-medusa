# Zahakowani — plan działania sklepu

Dokument planistyczny. Łączy strategię, architekturę, strukturę serwisu i roadmap.
Wracaj tu przed każdą większą decyzją żeby nie wprowadzać sprzeczności.

---

## 1. Kontekst biznesowy

**Co sprzedajemy:**
- **Kategoria 1:** haki holownicze + okablowanie (wiązki/moduły 7-pin/13-pin jako warianty haka)
- **Kategoria 2:** bagażniki rowerowe na hak
- **Kategoria 3:** wiązki i moduły sprzedawane samodzielnie (standalone, z flagą `fits_all_vehicles` dla uniwersalnych)
- **Wszystkie 3 kategorie implementowane od dnia 1** w Fazie 1 — sklep startuje z pełnym zakresem, nie etapowo
- **Kolejne kategorie w przyszłości** — architektura przygotowana, dodawanie kategorii to ~3-4 tyg roboty per kategoria

**Klient:**
- B2C — właściciel auta osobowego potrzebujący haka holowniczego
- Wiek 30-60, technicznie średnio biegły
- Kluczowa decyzja: "**czy do mojego auta pasuje**"
- Często porównuje ofertę między Allegro a sklepami własnymi
- Wartość koszyka: średnio ~700 zł

**Skąd ruch dzisiaj:**
- Allegro: ~1 mln zł obrotu rocznie (main channel)
- Sklep własny: marginalny, do uruchomienia od nowa

**Cel sklepu własnego:**
- Budowa marki i społeczności niezależnie od Allegro
- Marża bez 10-15% prowizji Allegro
- SEO long-tail jako stałe źródło ruchu organicznego
- Long-term: zmniejszenie zależności od jednego kanału (ryzyko algorytmu/banu Allegro)

**Pozycjonowanie (USP):**
- **Doradztwo**, nie tylko sprzedaż ("który hak do mojego auta")
- **Fitment search** — wybór po pojeździe (marka → model → generacja)
- **Autoryzowany dystrybutor** marek (Imioła Hak-Pol potwierdzone, inne do ustalenia)
- **Wysyłka 24h, montaż lokalnie w Lubichowie**

---

## 2. Cele

**3-6 miesięcy:**
- Launch sklepu na nowym stacku
- Pierwsze 50-100 produktów wystawionych
- Pierwsze transakcje organiczne
- Wstępny content (10-20 poradników)

**Rok 1:**
- Stały ruch organiczny (Google, long-tail)
- Sklep robi 10-20% obrotu Allegro
- 2 dodatkowe kategorie produktowe uruchomione
- Lista email (newsletter) min. 500 osób
- Pierwsze 50 recenzji produktów

**Rok 2+:**
- Sklep dorównuje obrotom Allegro lub przewyższa
- 5+ kategorii produktowych
- Możliwy partnerski lub B2B kanał (warsztaty montażowe)
- Eksport oferty na Allegro generowany ze sklepu (czyste dane)

---

## 3. Architektura techniczna

**Backend:** Medusa.js v2 (Node.js + TypeScript)
**Frontend:** Next.js (React + TypeScript)
**Baza danych:** PostgreSQL
**CMS (content/blog):** Sanity
**Search:** Postgres + indexy (start), Meilisearch jeśli potrzeba (later)
**Hosting backend:** Railway / Render
**Hosting frontend:** Vercel
**Płatności:** Stripe + Przelewy24/Tpay (decyzja niżej)
**Kurier:** InPost (paczkomaty) + DPD/DHL
**Faktury:** integracja z Fakturownią/iFirmą (decyzja niżej)
**Email/Newsletter:** Brevo (free tier) lub Klaviyo (jeśli się rozrośnie)

### Custom moduły Medusy

Pełna specyfikacja w osobnym dokumencie `zahakowani-medusa-brief.md`. Skrót:

- `hook_catalog` — model `Hook` (master record katalogu haka)
- `wiring_equipment` — 4 rekordy reużywane (wiązki/moduły 7/13-pin)
- `vehicle_fitment` — `Brand`, `VehicleModel`, `Generation` (**wspólne dla wszystkich kategorii**)
- W przyszłości: `roof_rack_catalog`, `tow_bar_accessories_catalog` itd. — analogicznie

Workflow `createProductFromHook` generuje Product + 5 wariantów (BARE, W7, W13, M7, M13) automatycznie z Hooka + Generation.

### Architektura pod multi-category

Każda kategoria = własny moduł z polami specyficznymi. Wspólne:
- `VehicleFitment` (jedno drzewo aut dla wszystkich kategorii)
- `Product` + `ProductVariant` (Medusa-native)
- Workflow pattern (template, kalkulator ceny, generator SKU)
- Wyszukiwarka cross-category po pojeździe

---

## 4. Struktura serwisu

### Mapa stron

```
/                                     — Strona główna
/haki                                 — Listing kategorii haki (wszystkie marki)
/haki/{brand}                         — Haki marki X (np. /haki/skoda)
/haki/{brand}/{model}                 — Haki model X (np. /haki/skoda/octavia)
/haki/{brand}/{model}/{generation}    — Haki dla konkretnej generacji (np. /haki/skoda/octavia/octavia-3-2013-2019)
/produkt/{handle}                     — Strona produktu
/produkt/{handle}/{variant}           — Strona wariantu (samodzielny URL)

/wyszukaj                             — Wyszukiwarka pojazdu (selektor Brand→Model→Generation)
/wyniki?vehicle={generationId}        — Wyniki dla pojazdu (cross-category)

/koszyk                               — Koszyk
/checkout                             — Checkout
/konto                                — Panel klienta (zamówienia, dane)
/konto/zamowienia/{id}                — Szczegóły zamówienia

/poradniki                            — Blog/poradniki (z CMS)
/poradniki/{slug}                     — Pojedynczy poradnik
/marki                                — Lista wszystkich obsługiwanych marek (hub SEO)
/marki/{brand}                        — Strona marki (cały katalog dla marki, wszystkie kategorie)

/o-nas                                — O firmie, autoryzacje
/montaz                               — Montaż w Lubichowie (lokalne SEO)
/dostawa-i-zwroty                     — Logistyka
/kontakt                              — Kontakt
/regulamin                            — Regulamin
/polityka-prywatnosci                 — Privacy
/dla-warsztatow                       — B2B landing (later)
```

### Nawigacja

**Top bar (sticky):**
- Logo
- Wyszukiwarka pojazdu (zawsze dostępna — to jest USP)
- Kategorie (dropdown: Haki, [2 inne kategorie])
- Poradniki
- Koszyk + Konto

**Footer:**
- Marki (linki do hubów SEO)
- Kategorie
- Pomoc (dostawa, zwroty, montaż)
- Firma (o nas, kontakt, regulamin)
- Newsletter signup
- Telefon + adres + autoryzacje (logo Imioła itp.)

### User flows kluczowe

**Flow A: "Mam auto, czego szukam":**
1. Wejście na stronę główną → widzi selektor pojazdu
2. Wybór Marki → Modelu → Generacji
3. Wyniki cross-category dla tego auta
4. Klik na hak → strona produktu z 5 wariantami
5. Wybór wariantu → dodanie do koszyka
6. Checkout → płatność → potwierdzenie

**Flow B: "Mam już produkt z Allegro/poleceniem":**
1. Bezpośrednie wejście na URL produktu (np. z reklamy, z linku w paczce)
2. Strona produktu z badge'em wariantu
3. Klik "Sprawdź dopasowanie do mojego auta" → otwiera selektor
4. Walidacja + dodanie do koszyka

**Flow C: "Edukacja przed zakupem":**
1. Wejście na poradnik z Google (np. "jak wybrać hak do skody octavii")
2. Czyta artykuł
3. Linki do konkretnych produktów w treści
4. Klik → produkt → koszyk

---

## 5. Funkcjonalności per faza

### MVP (do launchu)

**Frontend:**
- [x] Selektor pojazdu (3-stopniowy: Brand → Model → Generation)
- [x] Listing produktów per kategoria + per pojazd
- [x] Strona produktu z 5 wariantami, galerią, specyfikacją, opisem
- [x] Osobny URL per wariant (canonical, SEO)
- [x] Koszyk (bez logowania, gość-friendly)
- [x] Checkout (gość + opcjonalne konto)
- [x] Strony statyczne (regulamin, dostawa, kontakt)
- [x] Strona "O nas" z autoryzacjami
- [x] Responsywność (mobile-first)
- [x] Basic SEO (meta tags, structured data Product, sitemap)
- [x] 5-10 poradników startowych

**Backend / Admin:**
- [x] Custom moduły zgodnie z brief #1
- [x] Admin UI: formularz Hook, listing katalogu, przycisk "Wystaw produkt"
- [x] Seed: 4 WiringEquipment + 20-30 najpopularniejszych Brand/Model/Generation
- [x] Workflow `createProductFromHook` działający

**Integracje:**
- [x] Płatności (min. 1 PSP — Przelewy24 albo Stripe)
- [x] Kurier (min. InPost paczkomaty)
- [x] Faktury automatyczne
- [x] Email transakcyjny (potwierdzenia zamówień)

### V1 (po launchu, 1-3 mies)

**Frontend:**
- [ ] Recenzje produktów (własny system albo TrustMate/Opineo)
- [ ] Wishlist
- [ ] Last viewed products
- [ ] Cross-sell na karcie produktu (np. "pasujące akcesoria")
- [ ] Pop-up email capture
- [ ] Live chat (Tidio albo własny)

**Content:**
- [ ] 30+ poradników
- [ ] Filmy montażowe (YouTube embed na stronach produktów)
- [ ] Newsletter (Brevo, raz w miesiącu)

**Backend:**
- [ ] Reporting (sprzedaż, popularne produkty, konwersje)
- [ ] Stock alerts (admin powiadamiany przy niskim stanie)
- [ ] Import/eksport CSV produktów

### V2 (rok+)

- [ ] B2B portal dla warsztatów (rejestracja, ceny hurtowe)
- [ ] Generator ofert Allegro ze sklepu (synchronizacja, jeden source of truth)
- [ ] Eksport feedu Google Merchant Center (do Shopping Ads)
- [ ] Eksport feedu Facebook (do FB Ads)
- [ ] Loyalty program / punkty
- [ ] System poleceń (kupon -10% za zaproszenie znajomego)
- [ ] Strefa instalatorów (lista zaufanych warsztatów montażowych)

---

## 6. Decyzje strategiczne (podjęte)

| Decyzja | Status | Uzasadnienie |
|---|---|---|
| Stack: Medusa + Next.js | ✅ | Custom pola, fitment, kontrola, skalowanie długoterminowe |
| Zostawiamy WooCommerce w spokoju | ✅ | Sklep własny nic nie zarabia, nie warto naprawiać |
| Nie ratujemy Sage / Bedrock | ✅ | Pójdzie do kosza razem z Woo |
| Allegro = osobny system, brak synchronizacji w MVP | ✅ | Bałagan na Allegro, sklep startuje od zera |
| Brak importu danych z Woo | ✅ | Wystawiamy od nowa workflow'em Medusy |
| Multi-category architecture od dnia 1 | ✅ | 3 kategorie w planie, nie chcemy przepisywać po fakcie |
| 3 kategorie startowe | ✅ | Haki, bagażniki rowerowe, wiązki/moduły standalone |
| `VehicleFitment` wspólny dla wszystkich kategorii | ✅ | Wyszukiwarka cross-category to USP |
| Wariant = samodzielny URL + SEO | ✅ | Reklamy Shopping Ads na każdy wariant osobno |
| Soft launch przed cutover | ✅ | Zerowe ryzyko biznesowe |
| Postgres + indexy zamiast Algolii w MVP | ✅ | Wystarczy do startu, koszty 0 |
| Jeden uniwersalny szablon karty produktu | ✅ | Zmienia się tylko zawartość tabeli parametrów per kategoria |
| Filtry per kategoria ręcznie w kodzie | ✅ | Strict typing, prostsze niż EAV |
| Pola sztywne w schemie (nowe dodawane w kodzie) | ✅ | Parametry stabilne, ~raz na pół roku zmiany |
| Cena per wariant ręczna (nie wyliczana) | ✅ | Większa elastyczność |
| SKU per wariant explicite | ✅ | Wymóg Google Merchant + praca operacyjna |
| `fits_all_vehicles` flaga dla uniwersalnych | ✅ | Z przyciskiem "Zaznacz wszystkie" w UI |
| **CMS: Sanity** | ✅ | **Najszybszy do startu, dobre SDK pod Next.js** |
| **Design system: Material Design w Figmie** | ✅ | **Gotowy, do implementacji 1:1 w Fazie 3** |
| Płatności (PSP) | ✅ | Macie założone konto, podłączenie w Fazie 4 |
| Opinie | ✅ | TrustedShops |
| Analityka | ✅ | GTag |

---

## 7. Decyzje do podjęcia

| Decyzja | Opcje | Mój komentarz |
|---|---|---|
| **Faktury** | Fakturownia / iFirma / Wfirma / inFakt | Wybór księgowy. Fakturownia ma najlepsze API. Decyzja przed Fazą 4. |
| **Domena** | zahakowani.pl czy inna | Sprawdzić czy zachowujemy obecną. Decyzja przed Fazą 5. |
| **Email/Newsletter** | Brevo (free) / Klaviyo / MailerLite | Brevo na start, migracja jeśli rośniemy. Decyzja przed Fazą 4. |
| **Email transakcyjny** | Resend / Postmark / Brevo | Resend najprostszy. Decyzja przed Fazą 4. |
| **Hosting Medusy produkcyjny** | Railway / Render / własny VPS | Decyzja przed Fazą 5. |
| **Główny kurier "drzwi-drzwi"** | DPD / DHL / GLS | Plus InPost paczkomaty obowiązkowo. Decyzja przed Fazą 4. |
| **Plan contentu** | 5/10/20 artykułów startowych, jakie tematy? | Decyzja przed Fazą 5. |

---

## 8. Roadmap miesiąc po miesiącu

### Miesiąc 1 — Backend + Admin

**Tydzień 1-2:**
- Brief #1 (custom moduły Medusy) → Claude Code → implementacja
- Pierwsze migracje, modele, linki, workflow
- Seed danych: 4 WiringEquipment, 20-30 Brand/Model/Generation

**Tydzień 3-4:**
- Brief #2 (admin UI) → Claude Code → implementacja
- Formularze Hook, listing katalogu, "Wystaw produkt"
- Pierwsze 5 produktów wystawionych workflow'em

**Kamień milowy:** klikasz "Wystaw" i masz produkt z 5 wariantami w bazie w 30 sekund.

### Miesiąc 2 — Frontend MVP

**Tydzień 1-2:**
- Setup Next.js + design system + komponenty bazowe
- Strona główna + selektor pojazdu
- Listing produktów + filtry

**Tydzień 3-4:**
- Strona produktu z wariantami
- Koszyk + checkout (bez płatności jeszcze)
- Strony statyczne

**Kamień milowy:** możesz przeklikać sklep end-to-end bez płatności.

### Miesiąc 3 — Integracje + Content

**Tydzień 1-2:**
- Płatności (P24 + Stripe)
- Kurier (InPost API)
- Faktury (Fakturownia API)
- Email transakcyjny

**Tydzień 3-4:**
- CMS setup (Sanity/Payload) + 5-10 poradników startowych
- SEO podstawowe (sitemap, structured data, Search Console)
- Analityka (GA4 + Plausible)

**Kamień milowy:** pełna transakcja na produkcji testowej (twoja karta), faktura w mailu.

### Miesiąc 4 — Launch + Growth

**Tydzień 1-2:**
- Soft launch (rodzina, znajomi, mała kampania FB Ads 500-1000 zł)
- Bug fixing, hardening
- Pierwsze prawdziwe zamówienia

**Tydzień 3-4:**
- Pełny launch publiczny
- Google Ads (long-tail "hak do X")
- Pierwszy newsletter
- Plan contentu na kolejne 3 miesiące

**Kamień milowy:** sklep żyje, ma ruch, ma pierwsze sprzedaże organiczne.

---

## 9. Ryzyka i jak im przeciwdziałać

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja |
|---|---|---|---|
| Timeline przeciąga się do 6+ miesięcy | Wysokie | Średnie | Allegro leci, nie ma presji. OK z buforem. |
| Pierwszy launch ma bugi blokujące sprzedaż | Średnie | Wysokie | Soft launch przed pełnym, lista znajomych do testów |
| Brak ruchu organicznego pierwsze 6 miesięcy | Wysokie | Średnie | Allegro zarabia. Reklamy płatne w międzyczasie. Content nie zachudza. |
| Płatności mają problem (chargebacki, blokady) | Niskie | Wysokie | P24 ma sandbox. Testować dokładnie. Backup PSP. |
| Hosting/infra pada w peak | Średnie | Wysokie | Monitoring (Better Uptime), CDN, backup DB codzienny |
| Konkurencja kopiuje strukturę | Średnie | Niskie | USP to nie struktura, USP to content + doradztwo |
| Pojazd "nie pasuje" — klient wybiera złą generację | Wysokie | Średnie | Klauzula w regulaminie + przycisk "sprawdź ze sprzedawcą". Dopasowanie gwarantowane (komunikat z PDF). |
| Twórca burnoutuje przy 4 miesiącach solo | Średnie | Wysokie | Każdy tydzień ma kamień milowy. Brak skip-tygodni. Realna pauza co 4-6 tyg. |
| Allegro banuje konto → utrata głównego źródła | Niskie | Krytyczne | Sklep własny jako backup channel. Pełny katalog na sklepie. |
| ACF / WP / Woo licencje wygasają w trakcie | Bardzo niskie | Niskie | Już olane — Woo i tak idzie do kosza |

---

## 10. Świadomie out-of-scope w MVP

Żeby nie scope-creepować, te rzeczy **NIE** wchodzą w MVP:

- ❌ **B2B portal i progi rabatowe miesięczne** (priorytet 1 post-launch — patrz niżej)
- ❌ Loyalty / punkty / program lojalnościowy (V2)
- ❌ Filmy własne (YouTube embed wystarczy)
- ❌ Live chat (V1)
- ❌ Dashboard analityczny dla siebie poza GA4 (V1)
- ❌ Aplikacja mobilna (nigdy chyba)
- ❌ Multi-currency / multi-language (V2 jak będzie eksport)
- ❌ Synchronizacja z Allegro w obie strony (V2)
- ❌ Import z Woo (decyzja: nie robimy nigdy)
- ❌ Wyszukiwarka po VIN-ie auta (V2, wymaga TecDoc)
- ❌ Konfigurator typu "co potrzeba do montażu" (V2)
- ❌ System poleceń / referrali (V2)

**Każda z tych rzeczy fajna, ale dodanie ich do MVP = +1-2 miesiące timeline. NIE.**

### Wyjątek: B2B portal — pierwszy priorytet po MVP

**Decyzja:** B2B portal z progami rabatowymi miesięcznymi zaczynamy implementować **natychmiast po launch MVP**, jako pierwszą pracę w Fazie 6 (V1). Nie czekamy aż "pojawi się popyt".

Mechanika do zaimplementowania (pre-spec w historii czatu i w roadmapie Faza 6):
- Konta firmowe z NIP
- Progi rabatowe: np. 0-20k zł → 5%, 20k+ → 10% (rozszerzalne)
- Obrót netto = zakupy minus zwroty
- Reset liczników 1. dnia każdego miesiąca
- Custom moduł `b2b_pricing` + workflowy + admin UI + frontend

**Po sygnale "MVP launched" → zaczynamy pisać brief #4 (B2B) bez zwłoki.**

---

## 11. Następne kroki (na 2026-05-19)

**Stan:** Faza 1+2 zakończone. Przygotowanie do Fazy 3.

1. **Brief #3** (`zahakowani-frontend-brief.md`) — w pisaniu w Claude w claude.ai na podstawie `RAPORT-FAZA-2.md` + tej sekcji §4 (mapa stron, user flows) + `tech-stack-guidelines.md` §§16-25 (Next.js stack, RSC, rendering, SEO).

2. **Decyzja: domena** (§7) — `zahakowani.pl` czy nowa. Wpływa na meta tagi i `canonical` URLs już w Fazie 3.

3. **Eksport tokenów designu z Figmy** — kolory / typografia / spacing / breakpoints → do `apps/storefront/tailwind.config.ts`. Bez tego CC użyje placeholder z Material Design 3.

4. **Backend korekta** (CC autonomicznie po sygnale): currency EUR → PLN, region "Polska" + country PL + tax 23%, 1 placeholder shipping option.

5. **Po dostarczeniu briefu #3:** CC otwiera repo, czyta `CLAUDE.md` (auto-load) + raporty Faz 1/2, zaczyna Fazę 3 iteracyjnie zgodnie z guidelines §28 (sekcja-po-sekcji, test po każdej).

**Kamień milowy Fazy 3:** sklep przeklikany od strony głównej do koszyka (płatności w Fazie 4).

---

## 12. Reguły higieny (żeby nie nabrudzić)

Te zasady utrzymuj przez cały projekt — łamanie ich kosztuje tygodnie:

1. **Każda nowa funkcjonalność idzie najpierw do "Decyzje do podjęcia" w tym dokumencie.** Nie ma "a może by tak…" w trakcie. Zapisz, oceń przy następnym przeglądzie planu.

2. **Brak custom kodu dla single use case.** Jeśli piszesz coś specyficznie pod jeden produkt/jedną sytuację — to brud. Generalizuj albo wywal.

3. **Każdy moduł kategorii produktowej idzie tym samym patternem jak `hook_catalog`.** Brak "improwizacji" przy drugiej kategorii.

4. **`VehicleFitment` jest wspólny.** Nie kopiuj struktury Brand/Model/Generation w drugiej kategorii.

5. **Każdy commit ma message po polsku po który wiesz co tam jest.** Za 6 miesięcy nie pamiętasz po angielsku.

6. **Co tydzień przejrzyj ten dokument.** Jeśli coś się nie zgadza z rzeczywistością — popraw dokument, nie odwrotnie.

7. **Nie dodajesz pluginów / paczek bez powodu.** Każda zależność to dług.

8. **Database migrations są ze schematem — zero ręcznych zmian w bazie produkcyjnej.**

9. **Backupy codzienne od dnia 1.** Postgres → S3 albo Backblaze. Tanie, ratuje życie.

10. **Każdy launch (nawet patch) → najpierw na staging.** Brak hotfixów wprost na produkcję.

---

## 13. Powiązane dokumenty

- `zahakowani-roadmapa.md` — plan realizacji krok po kroku
- `zahakowani-tech-stack-guidelines.md` — stack technologiczny, konwencje kodu, wytyczne dla Claude Code
- `zahakowani-medusa-brief.md` v2.1 — szczegółowa specyfikacja custom modułów Medusy (brief #1, kategorie 1-3)
- (do napisania) `zahakowani-admin-ui-brief.md` — brief #2, admin UI (do napisania po Fazie 1)
- (do napisania) `zahakowani-frontend-brief.md` — brief #3, frontend Next.js (do napisania po Fazie 2)
- (do napisania) `zahakowani-content-plan.md` — plan contentu i poradników startowych

---

**Wersja dokumentu:** 1.0  
**Data:** [stan po rozmowie ustaleniowej]  
**Następny przegląd:** po implementacji briefu #1
