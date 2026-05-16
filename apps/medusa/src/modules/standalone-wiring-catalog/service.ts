import { MedusaService } from "@medusajs/framework/utils"
import { StandaloneWiring } from "./models"

class StandaloneWiringCatalogService extends MedusaService({
  StandaloneWiring,
}) {}

export default StandaloneWiringCatalogService
