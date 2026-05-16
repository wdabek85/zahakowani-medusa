# Zahakowani

Sklep z akcesoriami motoryzacyjnymi (haki holownicze, bagażniki rowerowe, wiązki).
Monorepo: **Medusa.js v2** (backend) + **Next.js 15** (storefront) + **Sanity** (CMS).

## Wymagania

- **Node.js 20+** (LTS)
- **npm 10+** (npm workspaces)
- **Docker Desktop** (Postgres + Redis lokalnie)
- **Git**

## Struktura

```
zahakowani/
├── apps/
│   ├── medusa/         # backend Medusa v2 (port 9000)
│   ├── storefront/     # Next.js 15 (port 8000) — Faza 3
│   └── studio/         # Sanity Studio — Faza 5
├── packages/
│   └── types/          # współdzielone typy TS
├── docs/               # dokumentacja projektu
│   └── briefs/
├── docker-compose.yml  # Postgres 16 + Redis 7
└── package.json        # workspace root
```

## Pierwsze uruchomienie

### 1. Sklonuj repo i wejdź do katalogu

```bash
git clone https://github.com/wdabek85/zahakowani-medusa.git
cd zahakowani-medusa
```

### 2. Skopiuj zmienne środowiskowe

```bash
cp .env.example .env
```

W `.env` zmień `JWT_SECRET` i `COOKIE_SECRET` na losowe wartości (na produkcji obowiązkowo).

### 3. Wystartuj bazę danych i Redis

```bash
npm run docker:up
```

Sprawdź czy kontenery wstały:

```bash
npm run docker:ps
```

Powinieneś zobaczyć dwa kontenery `zahakowani-postgres` i `zahakowani-redis` w statusie `healthy`.

### 4. Zainstaluj zależności

```bash
npm install
```

### 5. Wystartuj backend Medusy (po Fazie 1)

```bash
cd apps/medusa
npm run dev
```

Backend leci na `http://localhost:9000`, panel administratora pod `http://localhost:9000/app`.

## Komendy

| Komenda | Co robi |
|---|---|
| `npm run docker:up` | Stawia Postgres + Redis w tle |
| `npm run docker:down` | Wyłącza kontenery (dane przeżywają w wolumenach) |
| `npm run docker:ps` | Status kontenerów |
| `npm run docker:logs` | Logi kontenerów na żywo (Ctrl+C żeby wyjść) |

## Dokumentacja

Pełna dokumentacja w `docs/`:

- `plan-dzialania.md` — strategia, decyzje, roadmap miesiąc po miesiącu
- `roadmapa.md` — plan w czasie, status zadań
- `tech-stack-guidelines.md` — stack, konwencje, wytyczne dla Claude Code
- `briefs/` — briefy implementacyjne dla kolejnych faz

## Status projektu

**Faza 0** ✅ — decyzje strategiczne zamknięte
**Etap 0.1** ⏳ — setup monorepo (TERAZ)
**Faza 1** 🔒 — backend Medusy (czeka na 0.1)
