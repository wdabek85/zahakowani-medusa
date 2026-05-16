import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

/**
 * GET /store/landing/:brandCode
 *
 * SEO landing page data for "all products for brand X" (e.g. /haki/skoda).
 * Returns the brand with its models + generations, plus all hook products
 * linked to any generation of this brand. Brief #1 §10.
 */
export async function GET(req: MedusaRequest<unknown, { brandCode: string }>, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const brandCode = req.params.brandCode

  const { data: brands } = await query.graph({
    entity: "brand",
    fields: [
      "id", "code", "name", "logo_url",
      "models.id", "models.code", "models.name",
      "models.generations.id", "models.generations.code", "models.generations.name",
      "models.generations.year_from", "models.generations.year_to",
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
      generations: Array<{ id: string; code: string; name: string; year_from: number; year_to: number | null }>
    }>
  }

  const brand = brands[0] as BrandRow
  const allGenerationIds = brand.models.flatMap((m) => m.generations.map((g) => g.id))

  let products: unknown[] = []
  if (allGenerationIds.length) {
    const { data: gensWithProducts } = await query.graph({
      entity: "generation",
      fields: ["id", "products.id", "products.title", "products.handle", "products.thumbnail", "products.status"],
      filters: { id: allGenerationIds },
    })

    type GenRow = { id: string; products?: Array<{ id: string; title: string; handle: string; thumbnail: string | null; status: string }> }
    const seen = new Set<string>()
    for (const g of gensWithProducts as GenRow[]) {
      for (const p of g.products ?? []) {
        if (p.status === "published" && !seen.has(p.id)) {
          seen.add(p.id)
          products.push(p)
        }
      }
    }
  }

  res.json({
    brand: {
      id: brand.id,
      code: brand.code,
      name: brand.name,
      logo_url: brand.logo_url,
      models: brand.models.map((m) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        generations: m.generations.map((g) => ({
          ...g,
          years_label: g.year_to ? `${g.year_from}-${g.year_to}` : `${g.year_from}-obecnie`,
        })),
      })),
    },
    products,
    product_count: products.length,
  })
}
