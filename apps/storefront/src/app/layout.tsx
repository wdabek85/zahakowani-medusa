import type { Metadata } from "next"
import { Header, InfoBar, SubNav } from "@/components/layout"
import "../styles/globals.css"

// TODO iteracja 28 (Performance audit): re-enable `next/font/google` Inter z
// `display: swap`. Wyłączone w iteracji 1 — Next 15.5.18 + React 19 ma issue
// prerenderingu (React error #31 na /404 podczas `next build`). System font
// stack ze `font-sans` z Tailwind jako fallback działa OK na dev.

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
      <body className="flex min-h-screen flex-col bg-white text-secondary-900">
        <InfoBar />
        <Header />
        <SubNav />
        <main className="flex-1">{children}</main>
        {/* TODO iteracja 4.1: <Footer /> */}
      </body>
    </html>
  )
}
