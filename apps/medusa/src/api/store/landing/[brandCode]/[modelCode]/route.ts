import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

/**
 * GET /store/landing/:brandCode/:modelCode
 *
 * SEO landing page for "/haki/skoda/octavia". Brief #1 §10.
 */
export async function GET(
  req: MedusaRequest<unknown, { brandCode: string; modelCode: string }>,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { brandCode, modelCode } = req.params

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
  const model = brand.models.find((m) => m.code === modelCode)
  if (!model) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Model "${modelCode}" not found in brand "${brandCode}"`)
  }

  const genIds = model.generations.map((g) => g.id)
  let products: unknown[] = []
  if (genIds.length) {
    const { data: gensWithProducts } = await query.graph({
      entity: "generation",
      fields: ["id", "products.id", "products.title", "products.handle", "products.thumbnail", "products.status"],
      filters: { id: genIds },
    })
    const seen = new Set<string>()
    type GenRow = { products?: Array<{ id: string; status: string }> }
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
    brand: { id: brand.id, code: brand.code, name: brand.name, logo_url: brand.logo_url },
    model: {
      id: model.id,
      code: model.code,
      name: model.name,
      generations: model.generations.map((g) => ({
        ...g,
        years_label: g.year_to ? `${g.year_from}-${g.year_to}` : `${g.year_from}-obecnie`,
      })),
    },
    products,
    product_count: products.length,
  })
}
