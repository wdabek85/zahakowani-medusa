# Setup projektu Zahakowani na drugim komputerze (laptop)

**Dla kogo:** user chce pracować nad tym projektem zamiennie na PC stacjonarnym i laptopie.
**Cel:** po wykonaniu tej instrukcji laptop ma identyczne środowisko jak PC i można płynnie pracować na obu.
**Czas:** ~30-60 minut (zależnie od prędkości internetu — głównie ściąganie node_modules).

---

## TL;DR — najszybsza ścieżka

1. **Na PC (źródło):** zrób backup 3 plików `.env*` i wrzuć na pendrive/OneDrive
2. **Na laptopie:** zainstaluj 4 narzędzia (Node 20, Git, Docker Desktop, VS Code)
3. **Na laptopie:** sklonuj repo, wklej `.env`, `npm install`, `docker compose up`, seed bazę z nowa, `npm run dev`
4. **Workflow:** zawsze `git pull` przed pracą, `git push` po pracy

---

## Część 1: Co trzeba zainstalować na laptopie

### 1.1 Node.js 20 LTS (lub nowszy)

**Dlaczego:** Medusa wymaga Node 20+. Next.js 15 też.
**Skąd:** https://nodejs.org/en/download — wybierz **LTS** (Long Term Support).
**Sprawdź po instalacji:**
```powershell
node --version    # powinno wypisać v20.x.x lub v22.x.x
npm --version     # powinno wypisać 10.x.x lub nowsze
```

### 1.2 Git

**Dlaczego:** repo na GitHubie, trzeba pull/push.
**Skąd:** https://git-scm.com/download/win
**Sprawdź:**
```powershell
git --version    # git version 2.4x.x
```

**Skonfiguruj GitHub** (jednorazowo):
```powershell
git config --global user.name "Twoje Imię"
git config --global user.email "twoj@email.com"
```

**Login do GitHub** — masz prywatne repo, więc trzeba uwierzytelnić. Najłatwiej:
- Zainstaluj **GitHub CLI** (https://cli.github.com/) i zrób raz `gh auth login`
- ALBO wygeneruj Personal Access Token: https://github.com/settings/tokens → "classic" → uprawnienia `repo`. Token używasz jako "hasła" przy `git push`.

### 1.3 Docker Desktop

**Dlaczego:** Postgres + Redis chodzą w kontenerach (NIE instalujesz Postgresa natywnie).
**Skąd:** https://www.docker.com/products/docker-desktop/
**Sprawdź po instalacji + restart komputera:**
```powershell
docker --version           # Docker version 24.x lub nowszy
docker compose version     # Docker Compose version v2.x
```
Po pierwszym uruchomieniu Docker Desktop ikonka w trayu musi być zielona.

### 1.4 VS Code (zalecane, możesz inny IDE)

**Skąd:** https://code.visualstudio.com/
**Polecane rozszerzenia:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features (preinstalled)
- (opcjonalnie) GitLens

---

## Część 2: Co trzeba "wyeksportować" z PC stacjonarnego

Nie wszystko leci przez Git. Pliki z sekretami (`.env`) są w `.gitignore` (i słusznie). Trzeba je przenieść ręcznie.

### 2.1 Pliki do skopiowania (KRYTYCZNE)

Z PC, ze ścieżki `E:\zahakowani-medusa\`:

| Plik | Co zawiera | Skąd masz |
|---|---|---|
| `apps/medusa/.env` | DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET, CORS | Skopiowane z `.env.template` przy starcie Fazy 1 |
| `apps/storefront/.env.local` | NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY, NEXT_PUBLIC_MEDUSA_BACKEND_URL, region pl | Skopiowane z `.env.example` przy starcie Fazy 3 |

**Sposób przeniesienia (wybierz jeden):**

**Opcja A — Pendrive (najprostsza):**
1. Skopiuj te 2 pliki na pendrive
2. Wpinasz pendrive w laptop, wklejasz do tych samych ścieżek

**Opcja B — OneDrive / Google Drive / Dropbox:**
1. Stwórz folder "zahakowani-secrets" w chmurze (folder PRYWATNY!)
2. Wrzuć tam te 2 pliki
3. Na laptopie zaloguj się do chmury, ściągnij pliki, wklej do projektu

**Opcja C — Password manager (1Password / Bitwarden):**
1. Wklej zawartość każdego pliku jako "Secure Note" w managerze haseł
2. Na laptopie pobierasz z managera

**⚠️ NIGDY:**
- Nie commituj `.env` do Git (`.gitignore` to chroni — sprawdź że nie wyłączyłeś)
- Nie wrzucaj na Slack, email, Discord
- Nie wrzucaj na publiczny Google Drive

### 2.2 Co NIE trzeba przenosić

- **Kod** — leci przez Git (`git clone` ściąga wszystko)
- **node_modules** — odbudowywane na laptopie przez `npm install` (zajmuje 2-5GB, bez sensu kopiować)
- **Baza danych** — patrz część 4 niżej, masz wybór (eksport vs seed na nowo)
- **`.medusa/`, `.next/`** — folder z cache buildu, odbudowywany automatycznie

---

## Część 3: Setup na laptopie krok po kroku

### Krok 1: Wybierz lokalizację

W [memory CC](C:\Users\wdabe\.claude\projects) jest zapisana zasada: **NIE na `C:\LocalSites\`** (folder aplikacji Local, kolizja).

Sugerowane:
- Laptop SSD: `D:\projekty\zahakowani-medusa\` lub `C:\dev\zahakowani-medusa\`
- Cokolwiek byle nie `LocalSites/`

### Krok 2: Sklonuj repo z GitHuba

```powershell
# Wejdź do folderu docelowego
cd D:\projekty\          # lub gdzie chcesz

# Klon (jednorazowo)
git clone https://github.com/wdabek85/zahakowani-medusa.git

# Wejdź do projektu
cd zahakowani-medusa
```

**Sprawdź że jesteś na `main`:**
```powershell
git branch          # powinno pokazać * main
git log --oneline -3
```

### Krok 3: Skopiuj `.env` pliki

Z pendrive/chmury/menadżera haseł:

```
zahakowani-medusa\
├── apps/
│   ├── medusa/
│   │   └── .env                 ← WKLEJ TU plik z PC
│   └── storefront/
│       └── .env.local           ← WKLEJ TU plik z PC
```

**Sprawdź:**
```powershell
ls apps\medusa\.env              # powinien istnieć
ls apps\storefront\.env.local    # powinien istnieć
```

### Krok 4: Zainstaluj zależności (`npm install`)

```powershell
# W korzeniu projektu
npm install
```

To może zająć **3-10 minut** (zależnie od internetu). Tworzy `node_modules/` w `apps/medusa/`, `apps/storefront/` i ewentualnie w roocie.

**Jeśli rzuca błąd o peer dependencies** — to OK, `.npmrc` ma `legacy-peer-deps=true` i powinien sobie poradzić. Jeśli nie, uruchom ręcznie:
```powershell
npm install --legacy-peer-deps
```

### Krok 5: Wystartuj Docker (Postgres + Redis)

**Najpierw upewnij się że Docker Desktop działa** (ikona zielona w trayu).

```powershell
# W korzeniu projektu
docker compose up -d
```

To pobierze obrazy `postgres:16-alpine` i `redis:7-alpine` (~500 MB razem, pierwsze uruchomienie). Po następnych restartach kontenery startują w ~5 sekund.

**Sprawdź:**
```powershell
docker compose ps
# powinno pokazać 2 kontenery: zahakowani-postgres (port 55432) + zahakowani-redis (port 6379), status "Up X seconds (healthy)"
```

**⚠️ Jeśli zobaczysz "port 55432 already in use":** masz inny Postgres na laptopie. Albo zatrzymaj go, albo zmień port w `docker-compose.yml` (i zaktualizuj `DATABASE_URL` w `.env`).

### Krok 6: Wybór — odbudować bazę czy zaimportować dump?

To **najważniejsza decyzja** w setupie. Masz dwie ścieżki:

#### Ścieżka A — Seed na nowo (zalecane, czysto)

Baza danych zostanie wypełniona przez **skrypty z repo** (te same które wprowadzały dane na PC). Strata: **wszystko co wprowadziłeś ręcznie w admin UI**. Co dostajesz odbudowane automatycznie:
- ✅ Schema bazy (wszystkie tabele Medusy + custom moduły z Fazy 1)
- ✅ Admin user `admin@zahakowani.pl` / `admin123`
- ✅ Region Polska + PLN + tax VAT 23%
- ✅ Demo katalog: 4 marki (Skoda/VW/Ford/BMW) + 4 haki z 5 wariantami każdy + inventory

```powershell
cd apps\medusa

# 1. Migracje (tworzy schema)
npm run dev -- --migrate-only       # ALBO: npx medusa db:migrate

# 2. Seed adminowy user (jednorazowo)
npx medusa user --email admin@zahakowani.pl --password admin123 --invite

# 3. Region Polska/PLN + tax
npx medusa exec ./src/scripts/setup-poland-region.ts

# 4. Demo katalog (4 haki opublikowane)
npx medusa exec ./src/scripts/seed-demo-hooks.ts

# 5. (Opcjonalnie) początkowy seed Medusy z testowymi produktami
npx medusa exec ./src/scripts/initial-seed.ts
```

**Po każdym kroku** sprawdź że nie ma errorów. Jeśli któryś rzuci — patrz Troubleshooting niżej.

#### Ścieżka B — Eksport+import dumpa Postgresa (jeśli masz unikalne dane)

Gdy wprowadziłeś rzeczy w admin UI których NIE ma w skryptach (np. własne produkty, modyfikacje wariantów):

**Na PC stacjonarnym (eksport):**
```powershell
# Zrzuć całą bazę do pliku
docker exec zahakowani-postgres pg_dump -U zahakowani zahakowani > zahakowani-dump.sql

# Przenieś `zahakowani-dump.sql` na laptop (pendrive/chmura)
```

**Na laptopie (import):**
```powershell
# Najpierw migracje (żeby schema istniała)
cd apps\medusa
npx medusa db:migrate

# Następnie wgraj dump
Get-Content zahakowani-dump.sql | docker exec -i zahakowani-postgres psql -U zahakowani -d zahakowani
```

**Uwaga:** publishable key z `.env.local` musi pasować do tej bazy. Jeśli na PC był `pk_c1af8...`, ten klucz musi też być w bazie po imporcie. Jest, bo dump zawiera całą tabelę `publishable_api_key`.

#### Mojej rekomendacja

**Idź ŚCIEŻKĄ A (seed)** — jesteś w fazie deweloperskiej, wszystkie istotne dane są w skryptach repo, więc czysto i powtarzalnie. Plus to dobre ćwiczenie zrozumienia jak wszystko się odbudowuje.

### Krok 7: Uruchom backend Medusy

```powershell
cd apps\medusa
npm run dev
```

Czekaj na log:
```
Server is ready on port: 9000
Admin URL → http://localhost:9000/app
```

**Test:** otwórz w przeglądarce http://localhost:9000/app, zaloguj się `admin@zahakowani.pl` / `admin123`. Powinieneś zobaczyć panel z 4 hakami + region Poland.

### Krok 8: Uruchom storefront (w drugim terminalu)

**Zostaw backend działający w pierwszym terminalu**, otwórz **drugi terminal**:

```powershell
cd D:\projekty\zahakowani-medusa\apps\storefront
npm run dev
```

Czekaj na:
```
✓ Ready in ~1s
- Local: http://localhost:8000
```

**Test:** http://localhost:8000 — powinieneś zobaczyć stronę z navigacją (InfoBar + Header + SubNav + Footer).

🎉 **Setup zakończony!**

---

## Część 4: Workflow synchronizacji PC ↔ Laptop

### Zasada nr 1: zawsze pull przed pracą

```powershell
cd D:\projekty\zahakowani-medusa
git pull
```

To ściąga commity które zrobiłeś na drugim komputerze.

### Zasada nr 2: zawsze push po pracy

```powershell
git status              # sprawdź co się zmieniło
git add <pliki>
git commit -m "..."
git push origin main
```

### Zasada nr 3: `.env` NIE leci przez Git

Jeśli zmienisz `.env` na PC (np. nowy klucz API), trzeba **ręcznie** skopiować na laptop. Najlepiej:
- Aktualizuj plik w chmurze/manadżerze haseł od razu po zmianie
- Powiedom siebie w drugiej maszynie żeby pobrać świeży plik

### Zasada nr 4: konflikty migracji

Jeśli na jednym z komputerów dodałeś migrację Medusy (nowy moduł, nowe pole), drugi po `git pull` musi:
```powershell
cd apps\medusa
npx medusa db:migrate    # zastosuje nowe migracje na lokalnej bazie
```

CC zazwyczaj to robi automatycznie, ale dobrze wiedzieć.

### Zasada nr 5: node_modules może wymagać refreshu

Jeśli ktoś dodał paczkę na PC i zrobił commit `package.json` + `package-lock.json`, laptop po `git pull` musi:
```powershell
npm install     # zaktualizuje node_modules
```

---

## Część 5: Troubleshooting (znane problemy)

### "Port 55432 already in use" / "port 8000 in use" / "port 9000 in use"

Coś już chodzi na tych portach. Znajdź i zabij:

```powershell
# Znajdź proces na danym porcie
Get-NetTCPConnection -LocalPort 9000
# Zabij po PID
Stop-Process -Id <PID> -Force
```

### Migration timeout / "KnexTimeoutError: SELECT 1"

Medusa nie może się połączyć z Postgresem. Sprawdź:
1. Docker chodzi (`docker compose ps`)
2. `.env` ma poprawny port **55432** (NIE 5432!)
3. Kontener `zahakowani-postgres` jest `healthy` (czekaj 30s po pierwszym `up`)

### Admin UI nie ładuje produktów / "401 Unauthorized"

Spróbuj re-login (cookie sesji może być stary z PC).

### Storefront 500 / "Publishable API key required"

Sprawdź że `apps/storefront/.env.local` ma `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` ustawiony.
Sprawdź też że klucz pasuje do bazy — jeśli zrobiłeś seed na nowo, klucz **może być inny** niż w `.env.local` z PC.

Aby pobrać aktualny klucz z bazy laptopa:
1. http://localhost:9000/app → zaloguj się
2. Settings (zębatka) → Publishable API Keys
3. Skopiuj klucz i wklej do `apps/storefront/.env.local`
4. Restart storefront dev server

### "Cannot find module @medusajs/..."

```powershell
# W korzeniu projektu — czyste reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

### Storefront pokazuje stare style po pull

```powershell
cd apps\storefront
Remove-Item -Recurse -Force .next
npm run dev      # rebuild from scratch
```

---

## Część 6: Daily routine (codzienny workflow)

### Rano (na dowolnym komputerze)

```powershell
cd <ścieżka do projektu>
git pull                         # ściągnij nocne zmiany
docker compose up -d             # Postgres + Redis (jeśli zatrzymane)
cd apps\medusa
npm run dev                      # terminal 1 — backend

# w drugim terminalu:
cd <ścieżka>\apps\storefront
npm run dev                      # storefront
```

### Wieczorem (przed wyłączeniem komputera)

```powershell
# W każdym terminalu z dev serwerem: Ctrl+C
# Potem:
docker compose down              # zatrzymuje kontenery (dane zostają w wolumenie)

# Jeśli były zmiany w kodzie:
git status
git add ...
git commit -m "..."
git push origin main
```

---

## Część 7: Co przeczytać po setupie (priorytet wiedzy)

1. **`CLAUDE.md`** w korzeniu repo — stan projektu + kontekst dla CC. Zawsze aktualne.
2. **`docs/tech-stack-guidelines.md`** — konwencje (kebab-case, TS strict, etc.). Stałe dla całego projektu.
3. **`docs/briefs/frontend-brief.md`** — brief #3 Fazy 3 (1242 linie), plan iteracji na najbliższe tygodnie.
4. **`docs/raports/RAPORT-FAZA-1.md`** + **`RAPORT-FAZA-2.md`** — co już zostało zbudowane, lista endpointów, schematy.

CC po starcie w katalogu projektu **automatycznie ładuje CLAUDE.md** więc dostaje cały kontekst.

---

## Checklist końcowy

Po przejściu wszystkich kroków sprawdź:

- [ ] `git log --oneline -3` pokazuje te same commity co na PC
- [ ] Docker Desktop działa, `docker compose ps` pokazuje 2 zdrowe kontenery
- [ ] http://localhost:9000/app — login działa, widać produkty
- [ ] http://localhost:8000 — strona z navigacją się ładuje
- [ ] `apps/medusa/.env` istnieje (NIE jest w git)
- [ ] `apps/storefront/.env.local` istnieje (NIE jest w git)
- [ ] `git status` w korzeniu = "nothing to commit"

✅ Jeśli wszystkie haczyki — możesz pracować na laptopie identycznie jak na PC.
