import Image from "next/image"
import Link from "next/link"

/**
 * "Poradniki" — sekcja na stronie głównej (Figma node 414:1518).
 * Server Component. Osobna sekcja, NAD "Blog / Najpopularniejsze artykuły".
 *
 * Layout per Figma: nagłówek "Poradniki" + inline link "Zobacz więcej >",
 * pod nim rząd 4 kompaktowych kart POZIOMYCH — miniatura 160×86 (rounded-2px)
 * z lewej + kolumna tekstu (tytuł Roboto Medium 16/18 + "Czytaj więcej >"
 * Bold 12, Blue-900). Bez autora/daty/opisu — to odróżnia od BlogSection
 * (pełne karty artykułów z excerptem).
 *
 * MVP: dane mockowe — realne poradniki z Sanity (Faza 5). Copy z Figmy było
 * placeholderem z innego template'u → polski content o hakach.
 *
 * Width/padding wg site-wide konwencji (Hero/PopularProducts/Brands).
 *
 * TODO(wiring): "Zobacz więcej" → /poradniki, karty → /poradniki/{slug} —
 * strony nie istnieją (TBD-page, Faza 5 / Sanity). Patrz docs/cta-registry.md.
 */

interface Guide {
  slug: string
  title: string
  image: string
}

const GUIDES: readonly Guide[] = [
  {
    slug: "jak-wybrac-hak-holowniczy",
    title: "Jak wybrać hak holowniczy do swojego auta",
    image: "https://placehold.co/160x86/1c398e/ffffff?text=Poradnik",
  },
  {
    slug: "montaz-haka-w-aucie-dostawczym",
    title: "Jak prawidłowo zamontować hak holowniczy",
    image: "https://placehold.co/160x86/193cb8/ffffff?text=Montaz",
  },
  {
    slug: "wiazka-elektryczna-7-czy-13-pin",
    title: "Wiązka elektryczna 7 czy 13 pin — co wybrać",
    image: "https://placehold.co/160x86/2563eb/ffffff?text=Wiazka",
  },
  {
    slug: "przeglad-i-konserwacja-haka",
    title: "Przegląd i konserwacja haka holowniczego",
    image: "https://placehold.co/160x86/3b82f6/ffffff?text=Konserwacja",
  },
]

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/poradniki/${guide.slug}`}
      className="group flex flex-1 items-start gap-2 rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[160/86] w-40 shrink-0 overflow-hidden rounded-[2px] bg-secondary-100">
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          sizes="160px"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="font-heading text-base font-medium leading-[18px] text-black">
          {guide.title}
        </p>
        <p className="font-heading text-xs font-bold leading-[14px] text-primary-900">
          Czytaj więcej &gt;
        </p>
      </div>
    </Link>
  )
}

export function GuidesSection() {
  return (
    <section className="bg-white py-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 sm:px-8 lg:px-20">
        <div className="flex items-center gap-4">
          <h2 className="font-heading text-3xl font-medium leading-[38px] text-[#1d1d1d]">
            Poradniki
          </h2>
          {/* TODO(wiring): /poradniki — listing poradnikow (Faza 5 / Sanity) */}
          <Link
            href="/poradniki"
            className="font-heading text-base font-bold leading-[18px] text-primary-900 transition-colors hover:text-primary-800"
          >
            Zobacz więcej &gt;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  )
}
