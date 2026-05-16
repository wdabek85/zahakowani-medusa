import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/vehicle-fitment/tree
 *
 * Full Brand → Model → Generation tree with product counts (aggregated across
 * all categories that link to a generation). Used by `/admin/vehicles` page.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const [{ data: brands }, { data: generations }] = await Promise.all([
    query.graph({
      entity: "brand",
      fields: [
        "id", "code", "name", "display_order", "logo_url",
        "models.id", "models.code", "models.name", "models.display_order",
        "models.generations.id", "models.generations.code", "models.generations.name",
        "models.generations.year_from", "models.generations.year_to",
        "models.generations.body_type",
      ],
    }),
    query.graph({
      entity: "generation",
      fields: ["id", "products.id"],
    }),
  ])

  const productCountByGenId = new Map<string, number>()
  type GenWithProducts = { id: string; products?: Array<{ id: string }> }
  for (const g of generations as GenWithProducts[]) {
    productCountByGenId.set(g.id, (g.products ?? []).length)
  }

  type BrandPayload = {
    id: string; code: string; name: string; logo_url: string | null; display_order: number
    models: Array<{
      id: string; code: string; name: string; display_order: number
      generations: Array<{
        id: string; code: string; name: string; year_from: number; year_to: number | null; body_type: string | null
      }>
    }>
  }

  const result = (brands as BrandPayload[])
    .map((b) => {
      const models = (b.models ?? [])
        .map((m) => {
          const gens = (m.generations ?? [])
            .map((g) => ({
              id: g.id,
              code: g.code,
              name: g.name,
              year_from: g.year_from,
              year_to: g.year_to,
              body_type: g.body_type,
              years_label: g.year_to ? `${g.year_from}-${g.year_to}` : `${g.year_from}-obecnie`,
              product_count: productCountByGenId.get(g.id) ?? 0,
            }))
            .sort((a, b) => a.year_from - b.year_from)

          return {
            id: m.id,
            code: m.code,
            name: m.name,
            display_order: m.display_order,
            generations: gens,
            generation_count: gens.length,
            product_count: gens.reduce((sum, g) => sum + g.product_count, 0),
          }
        })
        .sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name, "pl"))

      return {
        id: b.id,
        code: b.code,
        name: b.name,
        logo_url: b.logo_url,
        display_order: b.display_order,
        models,
        model_count: models.length,
        generation_count: models.reduce((sum, m) => sum + m.generation_count, 0),
        product_count: models.reduce((sum, m) => sum + m.product_count, 0),
      }
    })
    .sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name, "pl"))

  res.json({ brands: result })
}
