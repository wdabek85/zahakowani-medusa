"use client"

import { ChevronRight, Mail, Phone, X } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF } from "@/lib/utils/constants"
import { NAV_CATEGORIES } from "./nav-data"

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

/**
 * Mobile slide-in drawer — kategorie + CTA + kontakt.
 *
 * Otwierany hamburgerem z `Header`. Custom implementacja (bez shadcn Sheet
 * / Radix Dialog) — chcemy mniej deps, drawer jest prosty.
 *
 * Features: Esc do zamknięcia, click on backdrop do zamknięcia, body scroll
 * lock gdy otwarty, ARIA `aria-hidden` na drawer'ze gdy zamknięty.
 *
 * TODO(wiring): /poradniki + linki kategorii z `NAV_CATEGORIES` (te same co
 * w Header/SubNav). Patrz docs/cta-registry.md.
 *
 * TODO V1 (a11y audit): focus trap + return focus na trigger po zamknięciu.
 * Aktualnie wystarczy dla MVP — focus nie jest "uwieziony" w drawer'ze.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-secondary-900/50 transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer */}
      <aside
        aria-label="Menu nawigacji"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-white shadow-xl transition-transform duration-200 ease-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header drawer'a */}
        <div className="flex items-center justify-between border-b border-secondary-200 px-4 py-4">
          <span className="text-xl font-bold tracking-wider text-secondary-900">
            ZAHAKOWANI
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded text-secondary-700 transition-colors hover:bg-secondary-100"
            aria-label="Zamknij menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body — kategorie + CTA */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <Link
            href="/poradniki"
            onClick={onClose}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full")}
          >
            Poradniki Samochodowe
          </Link>

          <ul className="mt-6 space-y-1">
            {NAV_CATEGORIES.map((cat) => (
              <li key={cat.href}>
                <Link
                  href={cat.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded px-3 py-3 text-base font-medium text-secondary-900 transition-colors hover:bg-secondary-100"
                >
                  {cat.label}
                  <ChevronRight
                    className="h-4 w-4 text-secondary-400"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer drawer'a — kontakt */}
        <div className="space-y-2 border-t border-secondary-200 px-4 py-4 text-sm">
          <a
            href={PHONE_HREF}
            className="flex items-center gap-2 text-secondary-700 transition-colors hover:text-primary-600"
          >
            <Phone className="h-4 w-4 text-primary-600" />
            {PHONE}
          </a>
          <a
            href={EMAIL_HREF}
            className="flex items-center gap-2 text-secondary-700 transition-colors hover:text-primary-600"
          >
            <Mail className="h-4 w-4 text-primary-600" />
            {EMAIL}
          </a>
        </div>
      </aside>
    </>
  )
}
