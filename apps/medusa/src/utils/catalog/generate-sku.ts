import { HookVariantCode } from "./types"

type GenerateSkuParams =
  | { category: "hook"; catalogNumber: string; variantCode: HookVariantCode; generationCode: string }
  | { category: "bike_rack"; catalogNumber: string }
  | { category: "standalone_wiring"; catalogNumber: string; generationCode?: string }

/**
 * Builds a unique SKU per variant.
 *
 * Diverges from brief #1 §8 by including the generation code for hook variants
 * (and optionally for standalone_wiring per-generation products). Reason:
 * Medusa enforces a global UNIQUE constraint on `product_variant.sku`. A single
 * Hook generates one Product per vehicle generation; without the generation
 * code, all "Z/016-M13" variants would collide when the same hook fits several
 * generations.
 *
 * Formats:
 *  - hook variant:                    "{catalog}-{generation}-{variant_code}"  e.g. "Z/016-octavia-3-M13"
 *  - bike_rack:                       "{catalog}"                              e.g. "BR-2024-01"
 *  - standalone_wiring (universal):   "{catalog}"                              e.g. "MOD-13-UNI-01"
 *  - standalone_wiring (per-gen):     "{catalog}-{generation}"                 e.g. "W-7-SK-octavia-3"
 *
 * Each variant has its own unique SKU (Google Merchant requirement, ops work).
 */
export function generateSku(params: GenerateSkuParams): string {
  if (params.category === "hook") {
    return `${params.catalogNumber}-${params.generationCode}-${params.variantCode}`
  }
  if (params.category === "standalone_wiring" && params.generationCode) {
    return `${params.catalogNumber}-${params.generationCode}`
  }
  // bike_rack and standalone_wiring universal: single-product, SKU = catalog_number
  return params.catalogNumber
}
