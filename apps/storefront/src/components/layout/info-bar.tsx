import { Mail, Phone, Truck } from "lucide-react"
import {
  EMAIL,
  EMAIL_HREF,
  FREE_SHIPPING_THRESHOLD_PLN,
  PHONE,
  PHONE_HREF,
} from "@/lib/utils/constants"

/**
 * Top info bar — kontakt + próg darmowej dostawy (Figma node 403:1721).
 *
 * Desktop: email + telefon po lewej, threshold + truck icon po prawej.
 * Mobile (<md): kontakt ukryty (jest w hamburger), threshold widoczny i wycentrowany.
 *
 * TODO V1: tekst promo "RABAT 5% na pierwsze zakupy dla Zarejestrowanych
 * użytkowników" z Figmy — dorzucamy razem z customer registration flow.
 */
export function InfoBar() {
  return (
    <div className="border-b border-secondary-200 bg-secondary-50">
      <div className="container flex items-center justify-between gap-4 py-2 text-xs text-secondary-600">
        {/* Kontakt — ukryte na mobile, w hamburger menu */}
        <div className="hidden items-center gap-5 md:flex">
          <a
            href={EMAIL_HREF}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary-600"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {EMAIL}
          </a>
          <a
            href={PHONE_HREF}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary-600"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {PHONE}
          </a>
        </div>

        {/* Threshold — zawsze widoczne, mobile = wycentrowane */}
        <div className="mx-auto inline-flex items-center gap-1.5 md:mx-0">
          <Truck className="h-4 w-4 text-primary-600" aria-hidden="true" />
          <span>
            Darmowa Dostawa{" "}
            <strong className="font-semibold text-secondary-900">
              od {FREE_SHIPPING_THRESHOLD_PLN}zł
            </strong>
          </span>
        </div>
      </div>
    </div>
  )
}
