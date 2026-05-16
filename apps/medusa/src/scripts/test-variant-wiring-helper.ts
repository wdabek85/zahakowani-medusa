import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getVariantWiringInfo } from "../admin/utils/variant-wiring"

export default async function testVariantWiringHelper({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  let failures = 0
  const expect = (label: string, actual: unknown, expected: unknown) => {
    if (JSON.stringify(actual) === JSON.stringify(expected)) logger.info(`  ✔ ${label}`)
    else {
      failures++
      logger.error(`  ✘ ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    }
  }

  logger.info("=== getVariantWiringInfo ===")

  expect(
    "BARE: variant with no metadata",
    getVariantWiringInfo({}),
    { label: "Sam hak", equipmentCode: "BARE" },
  )

  expect(
    "BARE: variant with null metadata",
    getVariantWiringInfo({ metadata: null }),
    { label: "Sam hak", equipmentCode: "BARE" },
  )

  expect(
    "BARE: metadata without wiring_equipment_id",
    getVariantWiringInfo({ metadata: { foo: "bar" } }),
    { label: "Sam hak", equipmentCode: "BARE" },
  )

  expect(
    "W7: full metadata",
    getVariantWiringInfo({
      metadata: { wiring_equipment_id: "we_w7", wiring_equipment_code: "W7" },
    }),
    { equipmentId: "we_w7", equipmentCode: "W7", label: "Wiązka 7-Pin" },
  )

  expect(
    "W13: full metadata",
    getVariantWiringInfo({
      metadata: { wiring_equipment_id: "we_w13", wiring_equipment_code: "W13" },
    }),
    { equipmentId: "we_w13", equipmentCode: "W13", label: "Wiązka 13-Pin" },
  )

  expect(
    "M7: full metadata",
    getVariantWiringInfo({
      metadata: { wiring_equipment_id: "we_m7", wiring_equipment_code: "M7" },
    }),
    { equipmentId: "we_m7", equipmentCode: "M7", label: "Moduł 7-Pin" },
  )

  expect(
    "M13: full metadata",
    getVariantWiringInfo({
      metadata: { wiring_equipment_id: "we_m13", wiring_equipment_code: "M13" },
    }),
    { equipmentId: "we_m13", equipmentCode: "M13", label: "Moduł 13-Pin" },
  )

  expect(
    "defensive: invalid code falls back to 'Wariant'",
    getVariantWiringInfo({
      metadata: { wiring_equipment_id: "we_x", wiring_equipment_code: "JUNK" },
    }),
    { equipmentId: "we_x", label: "Wariant" },
  )

  expect(
    "defensive: empty equipment_id treated as BARE",
    getVariantWiringInfo({
      metadata: { wiring_equipment_id: "", wiring_equipment_code: "W7" },
    }),
    { label: "Sam hak", equipmentCode: "BARE" },
  )

  if (failures === 0) logger.info("=== ALL TESTS PASSED ===")
  else logger.error(`=== ${failures} failure(s) ===`)
}
