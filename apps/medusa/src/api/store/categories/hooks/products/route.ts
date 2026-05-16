import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type HookProductRow = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  status: string
  created_at: string
  variants: Array<{ id: string; sku: string; title: string }>
  hook?: { catalog_number: string; manufacturer: string; homologation: string; ball_type: string; pulling_capacity_kg: number } | Array<unknown> | null
  generations?: Array<{ id: string; code: string; name: string; vehicle_model: { code: string; brand: { code: string } } }>
}

/**
 * GET /store/categories/hooks/products
 *
 * Listing of all hook products with filters. Brief #1 §10.
 *
 * Query params (all optional):
 *   brand_code, generation_id, pulling_capacity_min, pulling_capacity_max,
 *   ball_type, homologation, manufacturer, limit, offset, sort_by
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
      "id", "title", "handle", "thumbnail", "status", "created_at",
      "variants.id", "variants.sku", "variants.title",
      "hook.id", "hook.catalog_number", "hook.manufacturer",
      "hook.homologation", "hook.ball_type", "hook.pulling_capacity_kg",
      "generations.id", "generations.code", "generations.name",
      "generations.vehicle_model.code", "generations.vehicle_model.brand.code",
    ],
    filters: { status: "published" },
  })

  // Keep only products that actually have a hook link (category 1)
  let filtered = (products as HookProductRow[]).filter((p) => {
    const h = Array.isArray(p.hook) ? p.hook[0] : p.hook
    return Boolean(h)
  })

  const getHook = (p: HookProductRow) => (Array.isArray(p.hook) ? p.hook[0] : p.hook) as { manufacturer: string; ball_type: string; homologation: string; pulling_capacity_kg: number } | null
  const pullMin = q.pulling_capacity_min ? parseInt(q.pulling_capacity_min, 10) : null
  const pullMax = q.pulling_capacity_max ? parseInt(q.pulling_capacity_max, 10) : null

  filtered = filtered.filter((p) => {
    const h = getHook(p)
    if (!h) return false
    if (q.manufacturer && h.manufacturer !== q.manufacturer) return false
    if (q.ball_type && h.ball_type !== q.ball_type) return false
    if (q.homologation && h.homologation !== q.homologation) return false
    if (pullMin !== null && h.pulling_capacity_kg < pullMin) return false
    if (pullMax !== null && h.pulling_capacity_kg > pullMax) return false

    if (q.brand_code || q.generation_id) {
      const gens = p.generations ?? []
      if (q.generation_id && !gens.some((g) => g.id === q.generation_id)) return false
      if (q.brand_code && !gens.some((g) => g.vehicle_model.brand.code === q.brand_code)) return false
    }
    return true
  })

  filtered.sort((a, b) => {
    if (sortBy === "pulling_capacity_asc") return (getHook(a)?.pulling_capacity_kg ?? 0) - (getHook(b)?.pulling_capacity_kg ?? 0)
    if (sortBy === "pulling_capacity_desc") return (getHook(b)?.pulling_capacity_kg ?? 0) - (getHook(a)?.pulling_capacity_kg ?? 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const total = filtered.length
  res.json({
    products: filtered.slice(offset, offset + limit),
    count: total,
    limit,
    offset,
  })
}
