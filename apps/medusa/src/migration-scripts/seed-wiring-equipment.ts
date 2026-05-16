import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { WIRING_EQUIPMENT_MODULE } from "../modules/wiring-equipment"
import WiringEquipmentService from "../modules/wiring-equipment/service"

/**
 * Idempotent seeder for the 4 reusable WiringEquipment records (W7/W13/M7/M13).
 *
 * Runs automatically after `medusa db:migrate`. Skips records that already exist
 * (matched by `code`), so re-running the migration does not duplicate or overwrite.
 *
 * Test values per brief #1 §3: identical across all 4 records. Admin will replace
 * with real specs after Phase 2 (admin UI).
 */
export default async function seedWiringEquipment({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const wiringEquipment = container.resolve<WiringEquipmentService>(WIRING_EQUIPMENT_MODULE)

  const commonTestValues = {
    weight_kg: 2,
    description_html: "<p>Wartości testowe — do uzupełnienia po Fazie 2.</p>",
    has_fog_lights: true,
    has_reverse_lights: true,
    has_stop_lights: true,
    has_indicators: true,
    homologation: "E20",
    gallery: [] as string[],
  }

  const records = [
    { code: "W7", type: "harness" as const, pin_count: 7, name: "Wiązka 7-Pin", ...commonTestValues },
    { code: "W13", type: "harness" as const, pin_count: 13, name: "Wiązka 13-Pin", ...commonTestValues },
    { code: "M7", type: "module" as const, pin_count: 7, name: "Moduł 7-Pin", ...commonTestValues },
    { code: "M13", type: "module" as const, pin_count: 13, name: "Moduł 13-Pin", ...commonTestValues },
  ]

  const existing = await wiringEquipment.listWiringEquipments({
    code: records.map((r) => r.code),
  })
  const existingCodes = new Set(existing.map((r) => r.code))
  const toCreate = records.filter((r) => !existingCodes.has(r.code))

  if (toCreate.length === 0) {
    logger.info(`[seed-wiring-equipment] All 4 records already exist, skipping.`)
    return
  }

  await wiringEquipment.createWiringEquipments(toCreate)
  logger.info(`[seed-wiring-equipment] Created ${toCreate.length} record(s): ${toCreate.map((r) => r.code).join(", ")}`)
}
