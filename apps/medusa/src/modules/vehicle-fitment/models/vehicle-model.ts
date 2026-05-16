import { model } from "@medusajs/framework/utils"
import { Brand } from "./brand"
import { Generation } from "./generation"

export const VehicleModel = model.define("vehicle_model", {
  id: model.id().primaryKey(),
  code: model.text(),
  name: model.text(),
  display_order: model.number().default(0),
  brand: model.belongsTo(() => Brand, { mappedBy: "models" }),
  generations: model.hasMany(() => Generation),
}).indexes([
  {
    on: ["brand_id", "code"],
    unique: true,
  },
])
