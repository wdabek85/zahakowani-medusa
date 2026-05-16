import { z } from "zod"

/**
 * Update-only schema. WiringEquipment is seeded with 4 fixed records
 * (W7/W13/M7/M13) — admin can edit them but cannot create new or delete
 * (changing code/type/pin_count would break existing hook product variants
 * that reference them via `variant.metadata.wiring_equipment_code`).
 *
 * Brief #2 §6.
 */
export const updateWiringEquipmentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  weight_kg: z.number().int().positive().optional(),
  description_html: z.string().min(1).optional(),
  has_fog_lights: z.boolean().optional(),
  has_reverse_lights: z.boolean().optional(),
  has_stop_lights: z.boolean().optional(),
  has_indicators: z.boolean().optional(),
  homologation: z.string().min(1).max(20).optional(),
  gallery: z.array(z.string().min(1).max(1000)).optional(),
})

export type UpdateWiringEquipmentInput = z.infer<typeof updateWiringEquipmentSchema>
