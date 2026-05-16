import BikeRackCatalogModule from "../modules/bike-rack-catalog"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Product ↔ BikeRack (M:1, kategoria 2).
 *
 * One BikeRack generates one Product (no variant configurations, no vehicle
 * fitment) via the `createProductFromBikeRack` workflow.
 */
export default defineLink(
  ProductModule.linkable.product,
  BikeRackCatalogModule.linkable.bikeRack,
)
