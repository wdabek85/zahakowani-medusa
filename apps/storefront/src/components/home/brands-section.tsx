import Link from "next/link"
import { FEATURED_BRANDS } from "@/lib/utils/constants"

/**
 * "Sekcja Modele" — wyróżnione marki samochodowe (Figma 414:1474).
 * Server Component — statyczna lista z `FEATURED_BRANDS`.
 *
 * Width/padding wg site-wide konwencji (Header/Hero/PopularProducts):
 * `mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-20`.
 *
 * Chipy marek = szare pille (#d4d4d4 Neutral-300, Poppins Medium 16) zawijane
 * na mobile (`flex-wrap`).
 *
 * TODO(wiring): linki `/haki?marka={slug}` — strona listingu `/haki` nie
 * istnieje (TBD-page, iter 12). Patrz docs/cta-registry.md.
 */
export function BrandsSection() {
  return (
    <section className="bg-white py-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 sm:px-8 lg:px-20">
        <h2 className="font-heading text-2xl font-bold leading-7 text-black">
          Haki Holownicze do najpopularniejszych marek samochodowych
        </h2>

        <ul className="flex flex-wrap items-center gap-4">
          {FEATURED_BRANDS.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={`/haki?marka=${brand.slug}`}
                className="inline-flex items-center justify-center border border-[#d4d4d4] bg-[#d4d4d4] px-6 py-2 font-cta text-base font-medium leading-[26px] text-black transition-colors hover:border-primary-800 hover:bg-primary-800 hover:text-white"
              >
                {brand.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
