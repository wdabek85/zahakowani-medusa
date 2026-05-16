import { model } from "@medusajs/framework/utils"

export const Hook = model.define("hook", {
  id: model.id().primaryKey(),
  catalog_number: model.text().unique(),
  name: model.text(),
  manufacturer: model.text(),
  manufacturer_catalog_number: model.text().nullable(),
  pulling_capacity_kg: model.number(),
  vertical_load_kg: model.number(),
  homologation: model.text(),
  ball_type: model.text(),
  requires_bumper_cutting: model.boolean().default(false),
  warranty_years: model.number().default(2),
  weight_kg: model.number(),
  description_html: model.text(),
  short_description: model.text().nullable(),
  thumbnail: model.text(),
  gallery: model.json(),
  installation_manual_url: model.text().nullable(),
  certificate_url: model.text().nullable(),
}).indexes([
  { on: ["manufacturer"] },
  { on: ["pulling_capacity_kg"] },
  { on: ["ball_type"] },
])
