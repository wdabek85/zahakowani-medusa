import { model } from "@medusajs/framework/utils"
import { VehicleModel } from "./vehicle-model"

export const Brand = model.define("brand", {
  id: model.id().primaryKey(),
  code: model.text().unique(),
  name: model.text(),
  logo_url: model.text().nullable(),
  display_order: model.number().default(0),
  models: model.hasMany(() => VehicleModel),
})
