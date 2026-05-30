import { HeroSection } from "@/components/hero"
import {
  BlogSection,
  BrandsSection,
  GuidesSection,
  PopularProductsSection,
} from "@/components/home"

/**
 * Strona główna (Faza 3B).
 *
 * Sekcje w kolejności wg Figmy:
 *  1. HeroSection           — hero + VehicleSelector (Brand→Model→Generation)
 *  2. PopularProductsSection — "Najczęściej Przeglądane i Kupowane" (z bazy)
 *  3. BrandsSection         — "Sekcja Modele" (marki samochodowe)
 *  4. GuidesSection         — "Poradniki" (mock, docelowo Sanity)
 *  5. BlogSection           — "Najpopularniejsze artykuły" (mock, docelowo Sanity)
 *
 * TODO: WhyUsSection ("Dlaczego my", brief §6.7) — czeka na projekt w Figmie.
 * TODO iter 11: VehicleSelectorNavbar w Headerze (brief §6.2).
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularProductsSection />
      <BrandsSection />
      <GuidesSection />
      <BlogSection />
    </>
  )
}
