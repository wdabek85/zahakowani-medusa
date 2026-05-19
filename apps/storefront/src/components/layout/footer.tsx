import { Clock, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import {
  ADDRESS_CITY,
  ADDRESS_STREET,
  BUSINESS_HOURS,
  COMPANY_TAGLINE,
  EMAIL,
  EMAIL_HREF,
  PHONE,
  PHONE_HREF,
  SITE_NAME,
} from "@/lib/utils/constants"
import { FOOTER_LINK_GROUPS } from "./nav-data"

/**
 * Footer — ciemna stopka z 4 kolumnami (brand + opis | kontakt | 3× grupy linków)
 * i bottom barem z copyrightem.
 *
 * Wzorowany na obecnym sklepie WP (Figma jeszcze nie ma footera w master file).
 *
 * TODO: gdy user dostarczy SVG/PNG logo (głowa zwierzęcia + napis), wyniesć
 * tekstowe "ZAHAKOWANI" do osobnego `<Logo />` komponentu (Header + Footer
 * używają wtedy tego samego brandmark'u).
 *
 * Linki w grupach kierują na placeholdery — 404 do iteracji 26 (strony
 * statyczne MDX) lub V1 (konto klienta).
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-12 bg-secondary-900 text-secondary-300">
      <div className="container py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand + tagline */}
          <div className="lg:col-span-2 lg:pr-8">
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-wider text-white"
            >
              ZAHAKOWANI
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-secondary-400">
              {COMPANY_TAGLINE}
            </p>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Kontakt
            </h3>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-secondary-500">
                  Telefon
                </dt>
                <dd className="mt-1">
                  <a
                    href={PHONE_HREF}
                    className="inline-flex items-center gap-2 text-secondary-200 transition-colors hover:text-primary-400"
                  >
                    <Phone className="h-4 w-4 text-primary-400" aria-hidden="true" />
                    {PHONE}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-secondary-500">Email</dt>
                <dd className="mt-1">
                  <a
                    href={EMAIL_HREF}
                    className="inline-flex items-center gap-2 break-all text-secondary-200 transition-colors hover:text-primary-400"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-primary-400" aria-hidden="true" />
                    {EMAIL}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-secondary-500">
                  Godziny pracy
                </dt>
                <dd className="mt-1 inline-flex items-center gap-2 text-secondary-200">
                  <Clock className="h-4 w-4 text-primary-400" aria-hidden="true" />
                  {BUSINESS_HOURS}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-secondary-500">Adres</dt>
                <dd className="mt-1 inline-flex items-start gap-2 text-secondary-200">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary-400"
                    aria-hidden="true"
                  />
                  <span>
                    {ADDRESS_STREET}
                    <br />
                    {ADDRESS_CITY}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Grupy linków */}
          {FOOTER_LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {group.title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-secondary-300 transition-colors hover:text-primary-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-800">
        <div className="container py-6 text-xs text-secondary-500">
          <p>
            Copyright © {currentYear} {SITE_NAME}. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}
