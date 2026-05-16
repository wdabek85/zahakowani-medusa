import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { VEHICLE_FITMENT_MODULE } from "../../../../modules/vehicle-fitment"
import VehicleFitmentService from "../../../../modules/vehicle-fitment/service"
import { createBrandSchema } from "../../../../validators/vehicle-fitment"

/** GET /admin/vehicle-fitment/brands — flat list (admin can paginate by client-side). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  const brands = await service.listBrands({}, { take: 500 })
  res.json({ brands: brands.sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name, "pl")) })
}

/** POST /admin/vehicle-fitment/brands — create. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const input = createBrandSchema.parse(req.body)
    const service = req.scope.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
    const [brand] = await service.createBrands([input])
    res.status(201).json({ brand })
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.issues })
      return
    }
    if (err instanceof MedusaError && err.type === MedusaError.Types.CONFLICT) {
      res.status(409).json({ error: err.message })
      return
    }
    if (err instanceof Error && err.message.includes("already exists")) {
      res.status(409).json({ error: err.message })
      return
    }
    throw err
  }
}
