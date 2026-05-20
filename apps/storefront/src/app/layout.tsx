import type { Metadata } from "next"
import { Footer, Header, InfoBar, SubNav } from "@/components/layout"
import { Providers } from "./providers"
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
      <head>
        {/* Roboto (text/headings) + Poppins (CTAs) per Figma. Plain <link> instead
            of next/font until prerendering issue is resolved (see note above). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Poppins:wght@500;600&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-white font-sans text-secondary-900">
        <Providers>
          <InfoBar />
          <Header />
          <SubNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
