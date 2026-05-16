import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/vehicle-fitment/lookup
 *
 * Flat structure {brand, model, generation} for the cascading vehicle picker
 * on the frontend. One request returns everything to build the dropdown UX.
 *
 * Brief #1 §10.
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const query = _req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: brands } = await query.graph({
    entity: "brand",
    fields: [
      "id",
      "code",
      "name",
      "logo_url",
      "display_order",
      "models.id",
      "models.code",
      "models.name",
      "models.display_order",
      "models.generations.id",
      "models.generations.code",
      "models.generations.name",
      "models.generations.year_from",
      "models.generations.year_to",
      "models.generations.body_type",
    ],
  })

  type BrandPayload = {
    id: string
    code: string
    name: string
    logo_url: string | null
    display_order: number
    models: Array<{
      id: string
      code: string
      name: string
      display_order: number
      generations: Array<{
        id: string
        code: string
        name: string
        year_from: number
        year_to: number | null
        body_type: string | null
      }>
    }>
  }

  const result = (brands as BrandPayload[])
    .map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      logo_url: b.logo_url,
      models: (b.models ?? [])
        .map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          generations: (m.generations ?? [])
            .map((g) => ({
              id: g.id,
              code: g.code,
              name: g.name,
              year_from: g.year_from,
              year_to: g.year_to,
              body_type: g.body_type,
              years_label: g.year_to ? `${g.year_from}-${g.year_to}` : `${g.year_from}-obecnie`,
            }))
            .sort((a, b) => a.year_from - b.year_from),
        }))
        .sort((a, b) => {
          const ao = b.models.find((x) => x.id === a.id)?.display_order ?? 0
          const bo = b.models.find((x) => x.id === b.id)?.display_order ?? 0
          return ao - bo || a.name.localeCompare(b.name)
        }),
    }))
    .sort((a, b) => {
      const ao = brands.find((x) => x.id === a.id)?.display_order ?? 0
      const bo = brands.find((x) => x.id === b.id)?.display_order ?? 0
      return ao - bo || a.name.localeCompare(b.name)
    })

  res.json({ brands: result })
}
