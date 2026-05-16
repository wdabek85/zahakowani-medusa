import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

/**
 * GET /store/products/by-vehicle/:generationId
 *
 * Cross-category vehicle search (brief #1 §10).
 *
 * Strategy: read the products linked to the requested generation, then
 * classify them as hooks vs standalone_wiring by which catalog link they
 * carry. Also returns universal standalone_wiring + all bike_racks (which
 * never have fitment).
 */
export async function GET(req: MedusaRequest<unknown, { generationId: string }>, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const generationId = req.params.generationId

  const limit = Math.min(parseInt((req.query.limit as string) ?? "20", 10) || 20, 100)
  const offset = parseInt((req.query.offset as string) ?? "0", 10) || 0

  // 1) Verify generation exists
  const { data: genCheck } = await query.graph({
    entity: "generation",
    fields: ["id", "products.id"],
    filters: { id: generationId },
  })
  if (!genCheck.length) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Generation "${generationId}" not found`)
  }
  const linkedProductIds = (genCheck[0] as { products?: Array<{ id: string }> }).products?.map((p) => p.id) ?? []

  // 2) Load full product details + their catalog links for the linked products
  const hooks: unknown[] = []
  const perGenStandaloneWiring: unknown[] = []
  if (linkedProductIds.length) {
    const { data: linkedProducts } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "handle", "thumbnail", "status",
        "variants.id", "variants.sku",
        "hook.id", "hook.catalog_number", "hook.manufacturer", "hook.pulling_capacity_kg",
        "standalone_wiring.id", "standalone_wiring.catalog_number",
        "standalone_wiring.type", "standalone_wiring.pin_count",
      ],
      filters: { id: linkedProductIds, status: "published" },
    })

    type Row = {
      id: string; title: string; handle: string; thumbnail: string | null
      variants: Array<{ id: string; sku: string }>
      hook?: { id: string; catalog_number: string } | Array<{ id: string; catalog_number: string }> | null
      standalone_wiring?: { id: string; catalog_number: string } | Array<{ id: string; catalog_number: string }> | null
    }

    for (const p of linkedProducts as Row[]) {
      const h = Array.isArray(p.hook) ? p.hook[0] : p.hook
      const sw = Array.isArray(p.standalone_wiring) ? p.standalone_wiring[0] : p.standalone_wiring
      if (h) hooks.push(p)
      else if (sw) perGenStandaloneWiring.push(p)
    }
  }

  // 3) Universal standalone_wiring (fits_all_vehicles=true)
  const { data: allWiringProducts } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "handle", "thumbnail",
      "variants.id", "variants.sku",
      "standalone_wiring.id", "standalone_wiring.catalog_number",
      "standalone_wiring.type", "standalone_wiring.pin_count",
      "standalone_wiring.fits_all_vehicles",
    ],
    filters: { status: "published" },
  })
  const universalSwProducts = (allWiringProducts as Array<{
    standalone_wiring?: { fits_all_vehicles: boolean } | Array<{ fits_all_vehicles: boolean }>
  }>).filter((p) => {
    const sw = Array.isArray(p.standalone_wiring) ? p.standalone_wiring[0] : p.standalone_wiring
    return sw && (sw as { fits_all_vehicles: boolean }).fits_all_vehicles
  })
  const standalone_wiring = [...perGenStandaloneWiring, ...universalSwProducts]

  // 4) All bike_racks (universal)
  const { data: allBikeRackProducts } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "handle", "thumbnail",
      "variants.id", "variants.sku",
      "bike_rack.id", "bike_rack.catalog_number", "bike_rack.max_bikes",
    ],
    filters: { status: "published" },
  })
  const bike_racks = (allBikeRackProducts as Array<{ bike_rack?: unknown | unknown[] }>)
    .filter((p) => {
      const br = Array.isArray(p.bike_rack) ? p.bike_rack[0] : p.bike_rack
      return Boolean(br)
    })

  res.json({
    generation_id: generationId,
    hooks: hooks.slice(offset, offset + limit),
    standalone_wiring: standalone_wiring.slice(offset, offset + limit),
    bike_racks: bike_racks.slice(offset, offset + limit),
    totals: {
      hooks: hooks.length,
      standalone_wiring: standalone_wiring.length,
      bike_racks: bike_racks.length,
    },
  })
}
