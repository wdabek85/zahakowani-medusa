import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

/**
 * GET /store/vehicle-fitment/models/:modelId/generations
 *
 * Note (diverges from brief §10): we look up the model by `id` (not `code`)
 * because model `code` is only unique within a brand. The frontend can get
 * model ids from `/store/vehicle-fitment/lookup`.
 */
export async function GET(req: MedusaRequest<unknown, { modelId: string }>, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const modelId = req.params.modelId

  const { data: models } = await query.graph({
    entity: "vehicle_model",
    fields: [
      "id", "code", "name",
      "brand.id", "brand.code", "brand.name",
      "generations.id", "generations.code", "generations.name",
      "generations.year_from", "generations.year_to", "generations.body_type",
      "generations.products.id",
    ],
    filters: { id: modelId },
  })

  if (!models.length) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `VehicleModel "${modelId}" not found`)
  }

  type GenRow = {
    id: string; code: string; name: string
    year_from: number; year_to: number | null
    body_type: string | null
    products?: Array<{ id: string }>
  }

  const model = models[0] as {
    id: string; code: string; name: string
    brand: { id: string; code: string; name: string } | Array<{ id: string; code: string; name: string }>
    generations: GenRow[]
  }
  const brand = Array.isArray(model.brand) ? model.brand[0] : model.brand

  const generations = (model.generations ?? [])
    .map((g) => ({
      id: g.id,
      code: g.code,
      name: g.name,
      year_from: g.year_from,
      year_to: g.year_to,
      body_type: g.body_type,
      years_label: g.year_to ? `${g.year_from}-${g.year_to}` : `${g.year_from}-obecnie`,
      product_count: (g.products ?? []).length,
    }))
    .sort((a, b) => a.year_from - b.year_from)

  res.json({
    brand,
    model: { id: model.id, code: model.code, name: model.name },
    generations,
  })
}
