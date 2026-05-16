import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { VEHICLE_FITMENT_MODULE } from "../../../../modules/vehicle-fitment"
import VehicleFitmentService from "../../../../modules/vehicle-fitment/service"
import { createGenerationSchema } from "../../../../validators/vehicle-fitment"

/** POST /admin/vehicle-fitment/generations — create generation. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const input = createGenerationSchema.parse(req.body)
    const service = req.scope.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
    const [generation] = await service.createGenerations([input])
    res.status(201).json({ generation })
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
