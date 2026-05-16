import { HookVariantCode } from "./types"

type GenerateSkuParams =
  | { category: "hook"; catalogNumber: string; variantCode: HookVariantCode }
  | { category: "bike_rack"; catalogNumber: string }
  | { category: "standalone_wiring"; catalogNumber: string }

/**
 * Builds a unique SKU per variant, per brief #1 §8.
 *
 * Formats:
 *  - hook variant:        "{catalog_number}-{variant_code}"  e.g. "Z/016-M13", "Z/016-BARE"
 *  - bike_rack:           "{catalog_number}"                  e.g. "BR-2024-01"
 *  - standalone_wiring:   "{catalog_number}"                  e.g. "MOD-13-UNI-01"
 *
 * Each variant has its own unique SKU (Google Merchant requirement, ops work).
 */
export function generateSku(params: GenerateSkuParams): string {
  if (params.category === "hook") {
    return `${params.catalogNumber}-${params.variantCode}`
  }
  // bike_rack and standalone_wiring: single-variant products, SKU = catalog_number
  return params.catalogNumber
}
