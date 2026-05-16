import { MedusaService } from "@medusajs/framework/utils"
import { Hook } from "./models"

class HookCatalogService extends MedusaService({
  Hook,
}) {}

export default HookCatalogService
