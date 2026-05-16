import WiringEquipmentModule from "../modules/wiring-equipment"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * ProductVariant ↔ WiringEquipment (M:1, nullable, category 1 only).
 *
 * Hook products have 5 variants:
 *  - BARE (no wiring) → no link
 *  - W7, W13, M7, M13 → link to the matching WiringEquipment record
 *
 * Because Medusa stores links in a separate table, "nullable" is natural:
 * a variant without a link row simply has no associated WiringEquipment.
 */
export default defineLink(
  ProductModule.linkable.productVariant,
  WiringEquipmentModule.linkable.wiringEquipment,
)
