import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WIRING_EQUIPMENT_MODULE } from "../../../modules/wiring-equipment"
import WiringEquipmentService from "../../../modules/wiring-equipment/service"

/**
 * GET /admin/wiring-equipment
 *
 * Returns all 4 seeded WiringEquipment records (W7/W13/M7/M13), sorted by code.
 * No POST/DELETE — see `src/validators/wiring-equipment.ts` comment.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<WiringEquipmentService>(WIRING_EQUIPMENT_MODULE)
  const items = await service.listWiringEquipments({}, { take: 100 })

  const sorted = [...items].sort((a, b) => {
    const order = ["W7", "W13", "M7", "M13"]
    return order.indexOf(a.code) - order.indexOf(b.code)
  })

  res.json({ wiring_equipments: sorted })
}
