import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

/**
 * GET /store/landing/:brandCode/:modelCode/:generationCode
 *
 * SEO landing page for "/haki/skoda/octavia/octavia-3-2013-2019" — cross-category
 * fitment results for a specific vehicle. Brief #1 §10.
 *
 * Note: generationCode in the URL is the bare slug (e.g. "octavia-3"). The
 * "2013-2019" suffix that appears in `url_slug` is built from year_from/year_to
 * by the frontend / sitemap — not part of the route.
 */
export async function GET(
  req: MedusaRequest<unknown, { brandCode: string; modelCode: string; generationCode: string }>,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { brandCode, modelCode, generationCode } = req.params

  const { data: brands } = await query.graph({
    entity: "brand",
    fields: [
      "id", "code", "name", "logo_url",
      "models.id", "models.code", "models.name",
      "models.generations.id", "models.generations.code", "models.generations.name",
      "models.generations.year_from", "models.generations.year_to",
      "models.generations.body_type",
    ],
    filters: { code: brandCode },
  })

  if (!brands.length) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Brand "${brandCode}" not found`)
  }

  type BrandRow = {
    id: string; code: string; name: string; logo_url: string | null
    models: Array<{
      id: string; code: string; name: string
      generations: Array<{ id: string; code: string; name: string; year_from: number; year_to: number | null; body_type: string | null }>
    }>
  }
  const brand = brands[0] as BrandRow
  const model = brand.models.find((m) => m.code === modelCode)
  if (!model) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Model "${modelCode}" not found in brand "${brandCode}"`)
  }
  const generation = model.generations.find((g) => g.code === generationCode)
  if (!generation) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Generation "${generationCode}" not found in model "${modelCode}"`)
  }

  // Get product ids linked to this generation (query from generation side —
  // filtering products with `{ generations: { id } }` triggers a Medusa
  // resolver issue, see /products/by-vehicle/:generationId route).
  const { data: genWithProducts } = await query.graph({
    entity: "generation",
    fields: ["id", "products.id"],
    filters: { id: generation.id },
  })
  const linkedProductIds = (genWithProducts[0] as { products?: Array<{ id: string }> })?.products?.map((p) => p.id) ?? []

  let hooks: unknown[] = []
  let perGenSw: unknown[] = []
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
      id: string
      hook?: unknown | unknown[]
      standalone_wiring?: unknown | unknown[]
    }
    hooks = (linkedProducts as Row[]).filter((p) => Boolean(Array.isArray(p.hook) ? p.hook[0] : p.hook))
    perGenSw = (linkedProducts as Row[]).filter((p) => Boolean(Array.isArray(p.standalone_wiring) ? p.standalone_wiring[0] : p.standalone_wiring))
  }

  const { data: allWiring } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "handle", "thumbnail",
      "variants.id", "variants.sku",
      "standalone_wiring.id", "standalone_wiring.fits_all_vehicles",
      "standalone_wiring.type", "standalone_wiring.pin_count",
    ],
    filters: { status: "published" },
  })
  const universalSw = (allWiring as Array<{ standalone_wiring?: { fits_all_vehicles: boolean } | Array<{ fits_all_vehicles: boolean }> }>)
    .filter((p) => {
      const sw = Array.isArray(p.standalone_wiring) ? p.standalone_wiring[0] : p.standalone_wiring
      return sw && (sw as { fits_all_vehicles: boolean }).fits_all_vehicles
    })

  const { data: allBikeRacks } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "handle", "thumbnail",
      "variants.id", "variants.sku",
      "bike_rack.id", "bike_rack.catalog_number", "bike_rack.max_bikes",
    ],
    filters: { status: "published" },
  })
  const bikeRacks = (allBikeRacks as Array<{ bike_rack?: unknown | unknown[] }>).filter((p) => Boolean(Array.isArray(p.bike_rack) ? p.bike_rack[0] : p.bike_rack))

  const yearsLabel = generation.year_to ? `${generation.year_from}-${generation.year_to}` : `${generation.year_from}-obecnie`

  res.json({
    brand: { id: brand.id, code: brand.code, name: brand.name, logo_url: brand.logo_url },
    model: { id: model.id, code: model.code, name: model.name },
    generation: {
      ...generation,
      years_label: yearsLabel,
      url_slug: `${brand.code}/${model.code}/${generation.code}-${yearsLabel}`,
      full_name: `${brand.name} ${model.name} ${generation.name} ${yearsLabel}`,
    },
    products: {
      hooks,
      standalone_wiring: [...perGenSw, ...universalSw],
      bike_racks: bikeRacks,
    },
    totals: {
      hooks: hooks.length,
      standalone_wiring: perGenSw.length + universalSw.length,
      bike_racks: bikeRacks.length,
    },
  })
}
