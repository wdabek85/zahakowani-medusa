import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { STANDALONE_WIRING_CATALOG_MODULE } from "../../../../modules/standalone-wiring-catalog"
import StandaloneWiringCatalogService from "../../../../modules/standalone-wiring-catalog/service"
import { updateStandaloneWiringSchema } from "../../../../validators/standalone-wiring"

/** GET /admin/standalone-wiring/:id — detail + linked generations + products. Brief #2 §5.3. */
export async function GET(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let wiring
  try {
    wiring = await service.retrieveStandaloneWiring(req.params.id)
  } catch {
    res.status(404).json({ error: `StandaloneWiring "${req.params.id}" not found` })
    return
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "handle", "status", "thumbnail",
      "standalone_wiring.id",
      "generations.id", "generations.code", "generations.name",
      "generations.year_from", "generations.year_to",
      "generations.vehicle_model.name", "generations.vehicle_model.brand.name",
    ],
    filters: { status: ["draft", "published"] },
  })

  type ProductRow = {
    id: string; title: string; handle: string; status: string; thumbnail: string | null
    standalone_wiring?: { id: string } | Array<{ id: string }> | null
    generations?: Array<{
      id: string; code: string; name: string; year_from: number; year_to: number | null
      vehicle_model: { name: string; brand: { name: string } }
    }>
  }

  const linkedProducts = (products as ProductRow[]).filter((p) => {
    const sw = Array.isArray(p.standalone_wiring) ? p.standalone_wiring[0] : p.standalone_wiring
    return sw && sw.id === wiring.id
  })

  const generationsMap = new Map<string, {
    id: string; code: string; name: string; year_from: number; year_to: number | null
    years_label: string; vehicle_full_name: string
  }>()
  for (const p of linkedProducts) {
    for (const g of p.generations ?? []) {
      if (generationsMap.has(g.id)) continue
      const yearsLabel = g.year_to ? `${g.year_from}-${g.year_to}` : `${g.year_from}-obecnie`
      generationsMap.set(g.id, {
        id: g.id, code: g.code, name: g.name, year_from: g.year_from, year_to: g.year_to,
        years_label: yearsLabel,
        vehicle_full_name: `${g.vehicle_model.brand.name} ${g.vehicle_model.name} ${g.name} ${yearsLabel}`,
      })
    }
  }

  res.json({
    standalone_wiring: wiring,
    generations: Array.from(generationsMap.values()),
    products: linkedProducts.map((p) => ({
      id: p.id, title: p.title, handle: p.handle, status: p.status, thumbnail: p.thumbnail,
    })),
  })
}

/** PATCH /admin/standalone-wiring/:id — partial update. */
export async function PATCH(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  try {
    const input = updateStandaloneWiringSchema.parse(req.body)
    const service = req.scope.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)
    const sw = await service.updateStandaloneWirings({ id: req.params.id, ...input })
    res.json({ standalone_wiring: sw })
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.issues })
      return
    }
    if (err instanceof MedusaError && err.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({ error: err.message })
      return
    }
    throw err
  }
}

/** DELETE /admin/standalone-wiring/:id — soft-delete. */
export async function DELETE(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)
  try {
    await service.deleteStandaloneWirings([req.params.id])
    res.json({ id: req.params.id, deleted: true })
  } catch (err) {
    if (err instanceof MedusaError && err.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({ error: err.message })
      return
    }
    throw err
  }
}
