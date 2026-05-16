import { MedusaService } from "@medusajs/framework/utils"
import { BikeRack } from "./models"

class BikeRackCatalogService extends MedusaService({
  BikeRack,
}) {}

export default BikeRackCatalogService
