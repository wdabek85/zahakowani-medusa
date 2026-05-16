import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

/**
 * GET /store/vehicle-fitment/brands/:brandCode/models
 *
 * Brief #1 §10. Product count computed separately via generation→products
 * (see brands/route.ts for the same Medusa link-resolver workaround).
 */
export async function GET(req: MedusaRequest<unknown, { brandCode: string }>, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const brandCode = req.params.brandCode

  const { data: brands } = await query.graph({
    entity: "brand",
    fields: [
      "id", "code", "name",
      "models.id", "models.code", "models.name", "models.display_order",
    ],
    filters: { code: brandCode },
  })

  if (!brands.length) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Brand "${brandCode}" not found`)
  }

  type ModelRow = { id: string; code: string; name: string; display_order: number }
  const brand = brands[0] as { id: string; code: string; name: string; models: ModelRow[] }

  const modelIds = (brand.models ?? []).map((m) => m.id)
  let productsByModelId = new Map<string, Set<string>>()

  if (modelIds.length) {
    const { data: generations } = await query.graph({
      entity: "generation",
      fields: ["id", "vehicle_model_id", "products.id"],
      filters: { vehicle_model_id: modelIds },
    })

    type GenRow = { vehicle_model_id: string; products?: Array<{ id: string }> }
    for (const g of generations as GenRow[]) {
      const set = productsByModelId.get(g.vehicle_model_id) ?? new Set<string>()
      for (const p of g.products ?? []) set.add(p.id)
      productsByModelId.set(g.vehicle_model_id, set)
    }
  }

  const models = (brand.models ?? [])
    .map((m) => ({
      id: m.id,
      code: m.code,
      name: m.name,
      product_count: productsByModelId.get(m.id)?.size ?? 0,
    }))
    .sort((a, b) => {
      const ao = brand.models.find((x) => x.id === a.id)?.display_order ?? 0
      const bo = brand.models.find((x) => x.id === b.id)?.display_order ?? 0
      return ao - bo || a.name.localeCompare(b.name)
    })

  res.json({
    brand: { id: brand.id, code: brand.code, name: brand.name },
    models,
  })
}
