import { model } from "@medusajs/framework/utils"

export const WiringEquipment = model.define("wiring_equipment", {
  id: model.id().primaryKey(),
  code: model.text().unique(),
  type: model.enum(["harness", "module"]),
  pin_count: model.number(),
  name: model.text(),
  weight_kg: model.number(),
  description_html: model.text(),
  has_fog_lights: model.boolean(),
  has_reverse_lights: model.boolean(),
  has_stop_lights: model.boolean(),
  has_indicators: model.boolean(),
  homologation: model.text(),
  gallery: model.json(),
})
