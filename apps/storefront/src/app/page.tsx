/**
 * Iteracja 1 placeholder. Strona główna budowana w iteracji 6 (Faza 3B).
 *
 * Po iteracji 1 sprawdzasz:
 *  - http://localhost:8000 → ta strona się renderuje
 *  - http://localhost:9000/app → admin Medusy (osobny serwer, port 9000)
 */
export default function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

  return (
    <main className="container py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wider text-primary-600">
          Faza 3 — w budowie
        </p>
        <h1 className="mt-2 text-display-md font-bold text-secondary-900">
          zahakowani — storefront
        </h1>
        <p className="mt-4 text-lg text-secondary-600">
          Iteracja 1 (Faza 3A — fundament): Next.js 15 + Tailwind + TS strict + path alias{" "}
          <code className="rounded bg-secondary-100 px-1.5 py-0.5 text-sm">@/</code>.
        </p>

        <div className="mt-8 rounded-lg border border-secondary-200 bg-secondary-50 p-6">
          <h2 className="text-lg font-semibold text-secondary-900">Status środowiska</h2>
          <dl className="mt-4 grid gap-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-secondary-600">Storefront:</dt>
              <dd className="font-medium">http://localhost:8000 ✅ (ta strona)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-600">Backend Medusy:</dt>
              <dd className="font-medium">
                <a href={`${backendUrl}/app`} className="text-primary-600 hover:underline" target="_blank" rel="noreferrer">
                  {backendUrl}/app ↗
                </a>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-600">Plan iteracji:</dt>
              <dd className="font-medium">docs/briefs/frontend-brief.md §18 (31 iteracji)</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 text-sm text-secondary-500">
          <p>
            Następne iteracje:{" "}
            <span className="font-medium text-secondary-700">2 — atomy UI</span>,{" "}
            <span className="font-medium text-secondary-700">3 — Medusa client + constants</span>,{" "}
            <span className="font-medium text-secondary-700">4 — layout (Header/Footer/InfoBar)</span>.
          </p>
          <p className="mt-2">
            Po Fazie 3A zaczynamy strona po stronie (3B = strona główna).
          </p>
        </div>
      </div>
    </main>
  )
}
