import { medusaFetch } from "./client"

/**
 * Server-side product fetchers for the storefront.
 *
 * These run in Server Components (no React hooks), so they call `medusaFetch`
 * directly instead of TanStack Query. Pricing requires a `region_id`, so we
 * resolve the PLN region once and reuse it.
 */

interface StoreRegion {
  id: string
  currency_code: string
}

interface RegionsResponse {
  regions: StoreRegion[]
}

let cachedRegionId: string | null = null

/** Resolve (and cache) the region id used for PLN pricing. */
export async function getRegionId(): Promise<string | null> {
  if (cachedRegionId) return cachedRegionId

  const { regions } = await medusaFetch<RegionsResponse>("/store/regions")
  const match = regions.find((r) => r.currency_code === "pln") ?? regions[0]
  cachedRegionId = match?.id ?? null
  return cachedRegionId
}

interface StoreCalculatedPrice {
  calculated_amount: number | null
  currency_code: string | null
}

interface StoreVariant {
  id: string
  calculated_price?: StoreCalculatedPrice | null
}

interface StoreProduct {
  id: string
  title: string
  handle: string
  subtitle: string | null
  thumbnail: string | null
  variants: StoreVariant[] | null
}

interface ProductsResponse {
  products: StoreProduct[]
}

export interface PopularProduct {
  id: string
  handle: string
  title: string
  subtitle?: string
  thumbnail: string
  /** Lowest variant price in major units (PLN). */
  price: number
}

// Demo hooks have no thumbnail yet; placeholder until real assets land (V1).
const FALLBACK_THUMBNAIL =
  "https://placehold.co/600x600/eef2ff/1c398e?text=Zahakowani"

/** Lowest priced variant in major units, or null if none carry a PLN price. */
function lowestPrice(variants: StoreVariant[] | null): number | null {
  const amounts = (variants ?? [])
    .map((v) => v.calculated_price?.calculated_amount)
    .filter((a): a is number => typeof a === "number")

  return amounts.length ? Math.min(...amounts) : null
}

/**
 * "Najczęściej Przeglądane i Kupowane" — MVP proxy: most recently created
 * products that actually have a PLN price (filters out Medusa sample products
 * priced only in EUR/USD). Real popularity tracking is a V1 TODO.
 */
export async function getPopularProducts(limit = 8): Promise<PopularProduct[]> {
  const regionId = await getRegionId()
  if (!regionId) return []

  // Overfetch: some products lack a PLN price and get filtered out below.
  const params = new URLSearchParams({
    limit: String(limit * 2),
    order: "-created_at",
    region_id: regionId,
    fields: "id,title,handle,subtitle,thumbnail,*variants.calculated_price",
  })

  let products: StoreProduct[] = []
  try {
    const res = await medusaFetch<ProductsResponse>(
      `/store/products?${params.toString()}`,
      { next: { revalidate: 60 } },
    )
    products = res.products
  } catch {
    // Backend down or misconfigured key — render nothing instead of crashing.
    return []
  }

  return products
    .map((p): PopularProduct | null => {
      const price = lowestPrice(p.variants)
      if (price === null) return null

      return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        subtitle: p.subtitle?.trim() ? p.subtitle : undefined,
        thumbnail: p.thumbnail?.trim() ? p.thumbnail : FALLBACK_THUMBNAIL,
        price,
      }
    })
    .filter((p): p is PopularProduct => p !== null)
    .slice(0, limit)
}
