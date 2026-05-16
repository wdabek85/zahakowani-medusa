import type { HookVariantCode } from "../../utils/catalog"

/**
 * Minimal shape of a `ProductVariant` consumed by this helper.
 *
 * Defined structurally so the helper works regardless of which Medusa type
 * the caller carries (admin SDK DTO, query.graph row, etc.).
 */
export type VariantLike = {
  metadata?: Record<string, unknown> | null
}

export type VariantWiringInfo = {
  equipmentId?: string
  equipmentCode?: HookVariantCode
  label: string
}

const LABEL_BY_CODE: Record<HookVariantCode, string> = {
  BARE: "Sam hak",
  W7: "Wiązka 7-Pin",
  W13: "Wiązka 13-Pin",
  M7: "Moduł 7-Pin",
  M13: "Moduł 13-Pin",
}

const VALID_CODES: ReadonlySet<HookVariantCode> = new Set<HookVariantCode>([
  "BARE", "W7", "W13", "M7", "M13",
])

function isHookVariantCode(value: unknown): value is HookVariantCode {
  return typeof value === "string" && VALID_CODES.has(value as HookVariantCode)
}

/**
 * Reads `variant.metadata.wiring_equipment_id` / `.wiring_equipment_code` and
 * returns a structured wiring info object with a human-readable Polish label.
 *
 * Used everywhere the admin UI renders variant info for hook products —
 * lists, variant detail panels, widgets. See `tech-stack-guidelines.md` §26.1
 * for why metadata (not a real Module Link) holds this data in Medusa 2.15.2.
 *
 * Behavior:
 *  - metadata.wiring_equipment_id present + valid code  → full info (W7/W13/M7/M13)
 *  - metadata missing OR no wiring_equipment_id         → treated as BARE ("Sam hak")
 *  - metadata.wiring_equipment_code invalid             → falls back to "Wariant"
 *    (defensive — should never happen with our workflow but defends against
 *    manual DB edits)
 */
export function getVariantWiringInfo(variant: VariantLike): VariantWiringInfo {
  const metadata = variant.metadata
  if (!metadata || typeof metadata !== "object") {
    return { label: LABEL_BY_CODE.BARE, equipmentCode: "BARE" }
  }

  const equipmentId = metadata.wiring_equipment_id
  const equipmentCodeRaw = metadata.wiring_equipment_code

  if (typeof equipmentId !== "string" || !equipmentId) {
    return { label: LABEL_BY_CODE.BARE, equipmentCode: "BARE" }
  }

  if (!isHookVariantCode(equipmentCodeRaw)) {
    return { equipmentId, label: "Wariant" }
  }

  return {
    equipmentId,
    equipmentCode: equipmentCodeRaw,
    label: LABEL_BY_CODE[equipmentCodeRaw],
  }
}
