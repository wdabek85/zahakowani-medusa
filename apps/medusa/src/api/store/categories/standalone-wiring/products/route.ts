import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type SwProductRow = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  created_at: string
  variants: Array<{ id: string; sku: string }>
  standalone_wiring?: { catalog_number: string; manufacturer: string; type: string; pin_count: number; fits_all_vehicles: boolean } | Array<unknown> | null
  generations?: Array<{ id: string }>
}

/**
 * GET /store/categories/standalone-wiring/products
 *
 * Listing of standalone wiring products with filters. Brief #1 §10.
 *
 * Query: type ("harness"|"module"), pin_count (7|13), generation_id,
 * fits_all_vehicles (boolean), limit, offset.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const q = req.query as Record<string, string | undefined>

  const limit = Math.min(parseInt(q.limit ?? "20", 10) || 20, 100)
  const offset = parseInt(q.offset ?? "0", 10) || 0

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "handle", "thumbnail", "created_at",
      "variants.id", "variants.sku",
      "standalone_wiring.id", "standalone_wiring.catalog_number",
      "standalone_wiring.manufacturer", "standalone_wiring.type",
      "standalone_wiring.pin_count", "standalone_wiring.fits_all_vehicles",
      "generations.id",
    ],
    filters: { status: "published" },
  })

  const getSw = (p: SwProductRow) =>
    (Array.isArray(p.standalone_wiring) ? p.standalone_wiring[0] : p.standalone_wiring) as { type: string; pin_count: number; fits_all_vehicles: boolean } | null

  let filtered = (products as SwProductRow[]).filter((p) => Boolean(getSw(p)))

  const pinCount = q.pin_count ? parseInt(q.pin_count, 10) : null
  const fitsAll = q.fits_all_vehicles ? q.fits_all_vehicles === "true" : null

  filtered = filtered.filter((p) => {
    const sw = getSw(p)
    if (!sw) return false
    if (q.type && sw.type !== q.type) return false
    if (pinCount !== null && sw.pin_count !== pinCount) return false
    if (fitsAll !== null && sw.fits_all_vehicles !== fitsAll) return false
    if (q.generation_id) {
      // Include if linked to this generation OR if universal
      const linked = (p.generations ?? []).some((g) => g.id === q.generation_id)
      if (!linked && !sw.fits_all_vehicles) return false
    }
    return true
  })

  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  res.json({
    products: filtered.slice(offset, offset + limit),
    count: filtered.length,
    limit,
    offset,
  })
}
