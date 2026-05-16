import { model } from "@medusajs/framework/utils"
import { VehicleModel } from "./vehicle-model"

export const Generation = model.define("generation", {
  id: model.id().primaryKey(),
  code: model.text(),
  name: model.text(),
  year_from: model.number(),
  year_to: model.number().nullable(),
  body_type: model.text().nullable(),
  vehicle_model: model.belongsTo(() => VehicleModel, { mappedBy: "generations" }),
}).indexes([
  {
    on: ["vehicle_model_id", "code"],
    unique: true,
  },
])
