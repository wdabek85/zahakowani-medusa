import Link from "next/link"

// TODO Faza 3G iteracja 28 (Performance audit): `next build` rzuca
// "Cannot read properties of null (reading 'useContext')" w styled-jsx
// podczas prerenderingu /404 — duplicate React w monorepo (apps/medusa
// trzyma React 18.3.1 devDep, apps/storefront React 19.0.0). Wymaga
// `overrides` w root package.json albo wymuszenia singleton React przez
// webpack alias w `next.config.js`. Dev działa OK.

export default function NotFound() {
  return (
    <main className="container py-24">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-primary-600">404</p>
        <h1 className="mt-2 text-display-sm font-bold text-secondary-900">Strony nie znaleziono</h1>
        <p className="mt-4 text-secondary-600">Sprawdź adres lub wróć na stronę główną.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </main>
  )
}
