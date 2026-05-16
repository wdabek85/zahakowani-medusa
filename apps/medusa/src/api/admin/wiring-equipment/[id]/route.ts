import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { WIRING_EQUIPMENT_MODULE } from "../../../../modules/wiring-equipment"
import WiringEquipmentService from "../../../../modules/wiring-equipment/service"
import { updateWiringEquipmentSchema } from "../../../../validators/wiring-equipment"

/** GET /admin/wiring-equipment/:id */
export async function GET(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<WiringEquipmentService>(WIRING_EQUIPMENT_MODULE)
  try {
    const wiring = await service.retrieveWiringEquipment(req.params.id)
    res.json({ wiring_equipment: wiring })
  } catch {
    res.status(404).json({ error: `WiringEquipment "${req.params.id}" not found` })
  }
}

/** PATCH /admin/wiring-equipment/:id — edit subset of fields, brief #2 §6.2. */
export async function PATCH(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  try {
    const input = updateWiringEquipmentSchema.parse(req.body)
    const service = req.scope.resolve<WiringEquipmentService>(WIRING_EQUIPMENT_MODULE)
    const wiring = await service.updateWiringEquipments({ id: req.params.id, ...input })
    res.json({ wiring_equipment: wiring })
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

// Intentionally no POST / DELETE — see validator file.
