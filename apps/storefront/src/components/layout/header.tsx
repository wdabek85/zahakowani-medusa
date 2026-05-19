"use client"

import { Menu, Phone, Search, ShoppingCart, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { MobileMenu } from "./mobile-menu"

/**
 * Main header — biały pasek z logo, CTA, search, user, cart (Figma node 403:1721).
 *
 * Desktop (md+): logo + CTA Poradniki + search bar + Pomoc + user + cart z sumą.
 * Mobile (<md): hamburger + logo + search icon + user + cart (kompaktowy).
 *
 * TODO iteracja 21-22: integracja `cartItemCount` i `cartTotalFormatted`
 * z Medusa cart state (TanStack Query subscription do cart cookie).
 *
 * TODO iteracja 11: VehicleSelectorNavbar (kondensacja `VehicleSelectorHero`
 * gdy user scrolluje poniżej hero) — wrzucimy między logo a search.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Placeholder — zastąpione w iteracji 21-22 przez `useCart()` z Medusy.
  // Typ jawnie szerszy (number / string) — inaczej TS zawęża do literal `0`
  // i poniżej `cartItemCount === 1` rzuca błąd "no overlap".
  const cartItemCount: number = 0
  const cartTotalFormatted: string = "0,00 zł"

  return (
    <header className="border-b border-secondary-200 bg-white">
      <div className="container flex h-16 items-center gap-3 md:h-20 md:gap-6">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded text-secondary-700 transition-colors hover:bg-secondary-100 md:hidden"
          aria-label="Otwórz menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-wider text-secondary-900 md:text-2xl"
        >
          ZAHAKOWANI
        </Link>

        {/* CTA Poradniki — desktop only */}
        <Link
          href="/poradniki"
          className={cn(
            buttonVariants({ variant: "primary", size: "md" }),
            "hidden md:inline-flex",
          )}
        >
          Poradniki Samochodowe
        </Link>

        {/* Search — desktop full bar, mobile icon-only */}
        <form action="/szukaj" method="get" role="search" className="hidden flex-1 md:block">
          <div className="relative">
            <input
              type="search"
              name="q"
              placeholder="Szukaj produktu"
              className="h-10 w-full rounded bg-secondary-100 px-4 pr-11 text-sm text-secondary-900 placeholder:text-secondary-500 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Szukaj produktu"
            />
            <button
              type="submit"
              aria-label="Wyszukaj"
              className="absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded text-secondary-500 transition-colors hover:text-primary-600"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Right cluster — Pomoc + user + cart (plus mobile search icon) */}
        <div className="ml-auto flex items-center gap-1 md:gap-5">
          {/* Pomoc — desktop only */}
          <Link
            href="/kontakt"
            className="hidden items-center gap-2 text-sm text-secondary-700 transition-colors hover:text-primary-600 md:inline-flex"
          >
            <Phone className="h-5 w-5 text-primary-600" />
            <span className="font-medium">Pomoc</span>
          </Link>

          {/* Search icon — mobile only */}
          <Link
            href="/szukaj"
            className="inline-flex h-10 w-10 items-center justify-center rounded text-secondary-700 transition-colors hover:bg-secondary-100 md:hidden"
            aria-label="Szukaj"
          >
            <Search className="h-5 w-5" />
          </Link>

          {/* User icon */}
          <Link
            href="/konto"
            className="inline-flex h-10 w-10 items-center justify-center rounded text-secondary-700 transition-colors hover:bg-secondary-100"
            aria-label="Moje konto"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <Link
            href="/koszyk"
            className="group inline-flex items-center gap-2 rounded px-1 py-1 text-secondary-700 transition-colors hover:text-primary-600"
            aria-label={`Koszyk: ${cartItemCount} ${
              cartItemCount === 1 ? "produkt" : "produktów"
            }`}
          >
            <span className="relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-error-600 px-1 text-[10px] font-semibold leading-none text-white">
                {cartItemCount}
              </span>
            </span>
            <span className="hidden flex-col text-sm leading-tight md:inline-flex">
              <span className="text-xs text-secondary-500">Koszyk</span>
              <span className="font-medium">{cartTotalFormatted}</span>
            </span>
          </Link>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  )
}
