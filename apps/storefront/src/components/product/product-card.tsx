import Image from "next/image"
import Link from "next/link"
import { Info, Star } from "lucide-react"
import { cn } from "@/lib/utils/cn"

/**
 * Compact product card — used on home page (Polecane) and PDP (Powiązane).
 * Listing/search pages get a separate, wider component.
 * Reference: Figma `bFOpp42bkgVtsOlzH3CSbb` node 405:1311.
 *
 * TODO(wiring): (a) cała karta linkuje do `/produkt/{handle}` — strona PDP
 * w iter 13+. (b) Visual CTA "Kup Teraz" docelowo ma triggerować add-to-cart
 * zamiast nawigacji (wymaga useCart + stop propagation). Patrz docs/cta-registry.md.
 */

export interface ProductCardProduct {
  handle: string
  title: string
  subtitle?: string
  thumbnail: string
  thumbnailAlt?: string
  /** Price in major units (PLN). */
  price: number
  currency?: string
  /** 0-5; rounded down to full stars. */
  rating?: number
  reviewsCount?: number
  /** Hour (0-23) until which "next-day delivery" promise applies. */
  cutoffHour?: number
}

export interface ProductCardProps {
  product: ProductCardProduct
  className?: string
}

const priceFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 2,
})

function StarRating({ rating, reviewsCount }: { rating: number; reviewsCount: number }) {
  const filled = Math.max(0, Math.min(5, Math.floor(rating)))
  return (
    <div className="flex flex-1 items-end gap-0.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < filled ? "fill-amber-400 text-amber-400" : "fill-none text-secondary-300",
            )}
            strokeWidth={1.5}
            aria-hidden
          />
        ))}
      </div>
      <span className="text-[10px] leading-3 text-secondary-400">({reviewsCount})</span>
    </div>
  )
}

export function ProductCard({ product, className }: ProductCardProps) {
  const {
    handle,
    title,
    subtitle,
    thumbnail,
    thumbnailAlt,
    price,
    rating = 5,
    reviewsCount = 0,
    cutoffHour = 14,
  } = product

  const cutoffLabel = `${cutoffHour.toString().padStart(2, "0")}:00`

  return (
    <Link
      href={`/produkt/${handle}`}
      className={cn(
        "group flex w-[232px] flex-col gap-2 border border-secondary-100 bg-white p-4",
        "transition-colors hover:border-secondary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="relative aspect-square w-full overflow-hidden bg-secondary-50">
            <Image
              src={thumbnail}
              alt={thumbnailAlt ?? title}
              fill
              sizes="232px"
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex items-start gap-1">
            <StarRating rating={rating} reviewsCount={reviewsCount} />
            <Info className="h-4 w-4 text-secondary-400" aria-hidden />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-sm font-bold leading-4 text-secondary-900">
              {title}
            </h3>
            {subtitle ? (
              <p className="font-heading text-[10px] leading-3 text-secondary-400">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col text-black">
          <p className="font-heading text-4xl font-bold leading-[44px]">
            {priceFormatter.format(price)}
          </p>
          <p className="font-heading text-[10px] leading-3">
            Cena zawiera 23% VAT, nie obejmuje{" "}
            <span className="font-bold">kosztów dostawy</span>
          </p>
        </div>
      </div>

      <p className="font-heading text-[10px] font-bold leading-3">
        <span className="text-secondary-500">Kup do {cutoffLabel},</span>{" "}
        <span className="text-success-500"> dostawa następnego dnia.</span>
      </p>

      <span
        className={cn(
          "mt-auto flex w-full items-center justify-center border px-6 py-2",
          "border-primary-900 bg-primary-800 text-white",
          "font-cta text-base font-medium leading-[26px]",
          "transition-colors group-hover:bg-primary-900",
        )}
        aria-hidden
      >
        Kup Teraz
      </span>
    </Link>
  )
}
