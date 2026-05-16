import { model } from "@medusajs/framework/utils"

export const BikeRack = model.define("bike_rack", {
  id: model.id().primaryKey(),
  catalog_number: model.text().unique(),
  name: model.text(),
  manufacturer: model.text(),
  max_bikes: model.number(),
  max_bike_weight_kg: model.number(),
  max_total_load_kg: model.number(),
  // GraphQL enum values must be valid identifiers (cannot start with digit or contain "-"),
  // so we store as text + validate allowed values ("7-pin" | "13-pin") at the API/Zod layer.
  power_socket: model.text(),
  weight_kg: model.number(),
  length_cm: model.number(),
  has_lockable_attachment: model.boolean(),
  has_rear_lights: model.boolean(),
  has_tilt_function: model.boolean(),
  tool_free_assembly: model.boolean(),
  warranty_years: model.number().default(2),
  description_html: model.text(),
  short_description: model.text().nullable(),
  thumbnail: model.text(),
  gallery: model.json(),
  installation_manual_url: model.text().nullable(),
}).indexes([
  { on: ["manufacturer"] },
  { on: ["max_bikes"] },
])
