import type { Metadata } from "next"
import "../styles/globals.css"

// TODO iteracja 2: re-enable `next/font/google` Inter z `display: swap`.
// Wyłączone w iteracji 1 — Next 15.5.18 + React 19 ma issue prerenderingu
// (React error #31 na /404 podczas `next build`). System font stack ze
// `font-sans` z Tailwind jako fallback.

export const metadata: Metadata = {
  title: {
    default: "zahakowani — haki holownicze, bagażniki, wiązki",
    template: "%s | zahakowani",
  },
  description:
    "Sklep specjalistyczny z hakami holowniczymi, bagażnikami rowerowymi i wiązkami elektrycznymi. Doradztwo, autoryzowani dystrybutorzy, montaż w Lubichowie.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://zahakowani.pl"),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
