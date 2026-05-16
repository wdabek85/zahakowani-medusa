import StandaloneWiringCatalogModule from "../modules/standalone-wiring-catalog"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Product ↔ StandaloneWiring (M:1, kategoria 3).
 *
 * One StandaloneWiring generates:
 *  - 1 Product if `fits_all_vehicles = true` (no Generation links)
 *  - N Products (one per generationId) if `fits_all_vehicles = false`
 *
 * Created via `createProductFromStandaloneWiring` workflow.
 */
export default defineLink(
  ProductModule.linkable.product,
  StandaloneWiringCatalogModule.linkable.standaloneWiring,
)
