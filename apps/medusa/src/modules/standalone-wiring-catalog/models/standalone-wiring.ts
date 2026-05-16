import { model } from "@medusajs/framework/utils"

export const StandaloneWiring = model.define("standalone_wiring", {
  id: model.id().primaryKey(),
  catalog_number: model.text().unique(),
  name: model.text(),
  manufacturer: model.text(),
  type: model.enum(["harness", "module"]),
  pin_count: model.number(),
  weight_kg: model.number(),
  has_fog_lights: model.boolean(),
  has_reverse_lights: model.boolean(),
  has_stop_lights: model.boolean(),
  has_indicators: model.boolean(),
  homologation: model.text(),
  warranty_years: model.number().default(2),
  fits_all_vehicles: model.boolean(),
  description_html: model.text(),
  short_description: model.text().nullable(),
  thumbnail: model.text(),
  gallery: model.json(),
  installation_manual_url: model.text().nullable(),
}).indexes([
  { on: ["fits_all_vehicles"] },
  { on: ["type", "pin_count"] },
  { on: ["manufacturer"] },
])
