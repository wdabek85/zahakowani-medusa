import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type BikeRackProductRow = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  created_at: string
  variants: Array<{ id: string; sku: string }>
  bike_rack?: { catalog_number: string; manufacturer: string; max_bikes: number; max_total_load_kg: number; has_tilt_function: boolean } | Array<unknown> | null
}

/**
 * GET /store/categories/bike-racks/products
 *
 * Listing of bike rack products with filters. Brief #1 §10.
 *
 * Query params: max_bikes (exact), has_tilt_function (boolean),
 * max_total_load_min (gte), limit, offset, sort_by.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const q = req.query as Record<string, string | undefined>

  const limit = Math.min(parseInt(q.limit ?? "20", 10) || 20, 100)
  const offset = parseInt(q.offset ?? "0", 10) || 0
  const sortBy = q.sort_by ?? "created_at"

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "handle", "thumbnail", "created_at",
      "variants.id", "variants.sku",
      "bike_rack.id", "bike_rack.catalog_number", "bike_rack.manufacturer",
      "bike_rack.max_bikes", "bike_rack.max_total_load_kg", "bike_rack.has_tilt_function",
    ],
    filters: { status: "published" },
  })

  const getBr = (p: BikeRackProductRow) => (Array.isArray(p.bike_rack) ? p.bike_rack[0] : p.bike_rack) as { max_bikes: number; max_total_load_kg: number; has_tilt_function: boolean } | null

  let filtered = (products as BikeRackProductRow[]).filter((p) => Boolean(getBr(p)))

  const maxBikes = q.max_bikes ? parseInt(q.max_bikes, 10) : null
  const maxLoadMin = q.max_total_load_min ? parseInt(q.max_total_load_min, 10) : null
  const hasTilt = q.has_tilt_function ? q.has_tilt_function === "true" : null

  filtered = filtered.filter((p) => {
    const br = getBr(p)
    if (!br) return false
    if (maxBikes !== null && br.max_bikes !== maxBikes) return false
    if (maxLoadMin !== null && br.max_total_load_kg < maxLoadMin) return false
    if (hasTilt !== null && br.has_tilt_function !== hasTilt) return false
    return true
  })

  filtered.sort((a, b) => {
    if (sortBy === "max_bikes_desc") return (getBr(b)?.max_bikes ?? 0) - (getBr(a)?.max_bikes ?? 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  res.json({
    products: filtered.slice(offset, offset + limit),
    count: filtered.length,
    limit,
    offset,
  })
}
