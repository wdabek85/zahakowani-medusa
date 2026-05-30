import Image from "next/image"
import Link from "next/link"

/**
 * "Najpopularniejsze artykuły" — blog/poradniki na stronie głównej
 * (Figma node 414:1569). Server Component.
 *
 * MVP: statyczne dane mockowe — realne artykuły przyjdą z Sanity (Faza 5).
 * Copy z Figmy było placeholderem z innego template'u (stacje narciarskie,
 * "Berg POS") — zastąpione polskim contentem o hakach holowniczych.
 *
 * Width/padding wg site-wide konwencji (Hero/PopularProducts/Brands).
 *
 * TODO(wiring): "Czytaj więcej" → /poradniki/{slug} — strona nie istnieje
 * (TBD-page, Faza 5 / Sanity). Patrz docs/cta-registry.md.
 */

interface Article {
  slug: string
  author: string
  date: string
  title: string
  excerpt: string
  image: string
}

const ARTICLES: readonly Article[] = [
  {
    slug: "jak-dobrac-hak-holowniczy",
    author: "Marcin Jamróz",
    date: "15 czerwca 2024",
    title: "Jak dobrać hak holowniczy do swojego auta",
    excerpt:
      "Hak zdejmowany, składany czy stały? Podpowiadamy, który typ sprawdzi się przy przyczepce, bagażniku rowerowym i lawecie — oraz na co zwrócić uwagę przy homologacji.",
    image: "https://placehold.co/600x400/1c398e/ffffff?text=Poradnik+1",
  },
  {
    slug: "montaz-haka-w-aucie-dostawczym",
    author: "Marcin Jamróz",
    date: "7 listopada 2024",
    title: "Jak prawidłowo zamontować hak holowniczy w aucie dostawczym",
    excerpt:
      "Krok po kroku przez montaż belki i wiązki elektrycznej w samochodzie dostawczym. Wyjaśniamy różnice między modułem 7- i 13-pin oraz kiedy potrzebny jest moduł sterujący.",
    image: "https://placehold.co/600x400/193cb8/ffffff?text=Poradnik+2",
  },
  {
    slug: "wiazka-elektryczna-7-czy-13-pin",
    author: "Marcin Jamróz",
    date: "14 lutego 2024",
    title: "Wiązka elektryczna 7-pin czy 13-pin — co wybrać",
    excerpt:
      "Liczba pinów decyduje o tym, co podłączysz do przyczepy. Tłumaczymy, kiedy wystarczy 7-pin, a kiedy konieczny jest 13-pin — i jak dokupić adapter zamiast całej wiązki.",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Poradnik+3",
  },
]

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/poradniki/${article.slug}`}
      className="group flex flex-col gap-4 rounded-[2px] transition-shadow hover:drop-shadow-[1px_1px_10px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[600/206] w-full overflow-hidden rounded-[2px] bg-secondary-100">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 400px, 100vw"
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-heading text-xs leading-[14px] text-[#a1a1a1]">
          {article.author} | {article.date}
        </p>
        <h3 className="font-heading text-lg font-semibold leading-[22px] text-black">
          {article.title}
        </h3>
        <p className="font-heading text-xs leading-[14px] text-black">
          {article.excerpt}
        </p>
        <p className="font-heading text-xs font-bold leading-[14px] text-primary-900">
          Czytaj więcej &gt;
        </p>
      </div>
    </Link>
  )
}

export function BlogSection() {
  return (
    <section className="bg-white py-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 sm:px-8 lg:px-20">
        <h2 className="font-heading text-3xl font-medium leading-[38px] text-black">
          Najpopularniejsze artykuły
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ARTICLES.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
