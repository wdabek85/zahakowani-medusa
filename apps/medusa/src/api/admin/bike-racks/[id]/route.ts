import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { BIKE_RACK_CATALOG_MODULE } from "../../../../modules/bike-rack-catalog"
import BikeRackCatalogService from "../../../../modules/bike-rack-catalog/service"
import { updateBikeRackSchema } from "../../../../validators/bike-rack"

/** GET /admin/bike-racks/:id — detail + linked products. Brief #2 §4.3. */
export async function GET(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let bikeRack
  try {
    bikeRack = await service.retrieveBikeRack(req.params.id)
  } catch {
    res.status(404).json({ error: `BikeRack with id "${req.params.id}" not found` })
    return
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status", "thumbnail", "bike_rack.id"],
    filters: { status: ["draft", "published"] },
  })

  type ProductRow = {
    id: string; title: string; handle: string; status: string; thumbnail: string | null
    bike_rack?: { id: string } | Array<{ id: string }> | null
  }

  const linked = (products as ProductRow[]).filter((p) => {
    const b = Array.isArray(p.bike_rack) ? p.bike_rack[0] : p.bike_rack
    return b && b.id === bikeRack.id
  })

  res.json({
    bike_rack: bikeRack,
    products: linked.map((p) => ({
      id: p.id, title: p.title, handle: p.handle, status: p.status, thumbnail: p.thumbnail,
    })),
  })
}

/** PATCH /admin/bike-racks/:id — partial update. */
export async function PATCH(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  try {
    const input = updateBikeRackSchema.parse(req.body)
    const service = req.scope.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)
    const bikeRack = await service.updateBikeRacks({ id: req.params.id, ...input })
    res.json({ bike_rack: bikeRack })
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

/** DELETE /admin/bike-racks/:id — soft delete. */
export async function DELETE(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)
  try {
    await service.deleteBikeRacks([req.params.id])
    res.json({ id: req.params.id, deleted: true })
  } catch (err) {
    if (err instanceof MedusaError && err.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({ error: err.message })
      return
    }
    throw err
  }
}
