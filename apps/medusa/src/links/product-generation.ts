import VehicleFitmentModule from "../modules/vehicle-fitment"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Product ↔ Generation (M:N, shared by category 1 and category 3).
 *
 * One Product (hook or standalone-wiring with `fits_all_vehicles = false`)
 * fits one specific generation. From the other side, one Generation can have
 * many Products (different hook variants, different standalone wirings).
 *
 * Category 2 (bike racks) does NOT use this link — bike racks are universal.
 *
 * The auto-generated link table (`product_generation`) gets indexes on both
 * foreign keys, which powers the cross-category vehicle search endpoint
 * (`GET /store/products/by-vehicle/:generationId`, brief §10).
 */
export default defineLink(
  ProductModule.linkable.product,
  {
    linkable: VehicleFitmentModule.linkable.generation,
    isList: true,
  },
)
