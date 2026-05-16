import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { VEHICLE_FITMENT_MODULE } from "../../../../../modules/vehicle-fitment"
import VehicleFitmentService from "../../../../../modules/vehicle-fitment/service"
import { updateGenerationSchema } from "../../../../../validators/vehicle-fitment"

export async function GET(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  try {
    const generation = await service.retrieveGeneration(req.params.id)
    res.json({ generation })
  } catch {
    res.status(404).json({ error: `Generation "${req.params.id}" not found` })
  }
}

export async function PATCH(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  try {
    const input = updateGenerationSchema.parse(req.body)
    const service = req.scope.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
    const generation = await service.updateGenerations({ id: req.params.id, ...input })
    res.json({ generation })
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

export async function DELETE(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  try {
    await service.deleteGenerations([req.params.id])
    res.json({ id: req.params.id, deleted: true })
  } catch (err) {
    if (err instanceof MedusaError && err.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({ error: err.message })
      return
    }
    throw err
  }
}
