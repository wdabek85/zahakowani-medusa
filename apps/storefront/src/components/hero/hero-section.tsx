import Link from "next/link"
import { VehicleSelector } from "./vehicle-selector"

/**
 * Home hero — Figma node 407:1435 (Rozmiar=Desktop, 1440×452).
 *
 * Layout: VehicleSelector on the left, marketing headline + CTA on the right.
 * Mobile/tablet stacks vertically (selector first per Figma 407:1446 Mobile).
 *
 * Placeholder content (TODO: review with user):
 *  - Headline copy is our own PL replacement for Figma placeholder
 *    ("GET UP TO Haki Holownicze On All Engine Oil Products" was leftover from
 *    another template).
 *  - Background is a flat gradient until a real hero photo is provided.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary-100">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-secondary-200 via-secondary-100 to-primary-50"
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-12 px-4 py-12 sm:px-8 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-20 lg:py-20">
        <VehicleSelector className="w-full lg:w-[620px]" />

        <div className="flex w-full max-w-[620px] flex-col items-start gap-6">
          <h1 className="font-heading text-4xl font-bold leading-tight text-black sm:text-5xl lg:text-[68px] lg:leading-[58px]">
            Haki holownicze do każdego auta
          </h1>
          <p className="font-heading text-lg leading-snug text-secondary-700 sm:text-xl lg:text-2xl">
            Wybierz markę, model i rocznik — pokażemy tylko pasujące produkty.
          </p>
          <Link
            href="/szukaj"
            className="inline-flex items-center justify-center border border-accent-600 bg-accent-600 px-6 py-2 font-cta text-base font-medium uppercase leading-[26px] text-white transition-colors hover:bg-accent-700"
          >
            Sprawdź ofertę
          </Link>
        </div>
      </div>
    </section>
  )
}
