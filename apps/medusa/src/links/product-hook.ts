import HookCatalogModule from "../modules/hook-catalog"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Product ↔ Hook (M:1, kategoria 1).
 *
 * One Hook (catalog master record) generates many Products — one per vehicle
 * generation it fits — via the `createProductFromHook` workflow.
 */
export default defineLink(
  ProductModule.linkable.product,
  HookCatalogModule.linkable.hook,
)
