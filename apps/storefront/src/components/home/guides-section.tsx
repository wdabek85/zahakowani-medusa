import Image from "next/image"
import Link from "next/link"

/**
 * "Poradniki" — sekcja na stronie głównej (Figma node 403:1722).
 * Server Component. Osobna sekcja, NAD "Blog / Najpopularniejsze artykuły".
 *
 * Prosta karta: obraz (aspect 336/180, rounded-4px) + tytuł (Roboto SemiBold
 * 18/24) + krótki opis (Roboto Regular 14/20, #525252). Bez autora/daty/CTA —
 * to odróżnia ją od BlogSection (bogatsze karty artykułów).
 *
 * MVP: dane mockowe — realne poradniki z Sanity (Faza 5).
 *
 * TODO(wiring): karta → /poradniki/{slug} — strona nie istnieje (TBD-page,
 * Faza 5 / Sanity). Patrz docs/cta-registry.md.
 */

interface Guide {
  slug: string
  title: string
  excerpt: string
  image: string
}

const GUIDES: readonly Guide[] = [
  {
    slug: "jak-wybrac-hak-holowniczy",
    title: "Jak wybrać hak holowniczy?",
    excerpt:
      "Praktyczny przewodnik po typach haków holowniczych i ich zastosowaniu.",
    image: "https://placehold.co/336x180/1c398e/ffffff?text=Poradnik",
  },
  {
    slug: "montaz-haka-krok-po-kroku",
    title: "Montaż haka krok po kroku",
    excerpt:
      "Co przygotować przed montażem i jak bezpiecznie zamontować belkę oraz wiązkę.",
    image: "https://placehold.co/336x180/193cb8/ffffff?text=Montaz",
  },
  {
    slug: "wiazka-elektryczna-7-czy-13-pin",
    title: "Wiązka elektryczna 7 czy 13 pin?",
    excerpt:
      "Czym różnią się wiązki i którą wybrać do przyczepy, bagażnika lub lawety.",
    image: "https://placehold.co/336x180/2563eb/ffffff?text=Wiazka",
  },
  {
    slug: "przeglad-i-konserwacja-haka",
    title: "Przegląd i konserwacja haka",
    excerpt:
      "Jak dbać o hak holowniczy, by służył latami i przeszedł każdy przegląd.",
    image: "https://placehold.co/336x180/3b82f6/ffffff?text=Konserwacja",
  },
]

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/poradniki/${guide.slug}`}
      className="group flex flex-col gap-2 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[336/180] w-full overflow-hidden rounded-[4px] bg-secondary-100">
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          sizes="(min-width: 1024px) 336px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform group-hover:scale-[1.03]"
          unoptimized
        />
      </div>
      <h3 className="font-heading text-lg font-semibold leading-6 text-black">
        {guide.title}
      </h3>
      <p className="font-heading text-sm leading-5 text-[#525252]">
        {guide.excerpt}
      </p>
    </Link>
  )
}

export function GuidesSection() {
  return (
    <section className="bg-white py-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 sm:px-8 lg:px-20">
        <h2 className="font-heading text-2xl font-bold leading-7 text-black">
          Poradniki
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  )
}
