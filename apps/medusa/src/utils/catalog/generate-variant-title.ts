import { GenerationInput, HookInput, HookVariantCode } from "./types"
import { getYearsLabel } from "./years-label"

const VARIANT_SUFFIX: Record<HookVariantCode, string> = {
  BARE: "",
  W7: " + Wiązka 7-Pin",
  W13: " + Wiązka 13-Pin",
  M7: " + Moduł 7-Pin",
  M13: " + Moduł 13-Pin",
}

/**
 * Builds a hook product's variant title per brief #1 §8.
 *
 * Template: "Hak holowniczy{variant_suffix} {brand} {model} {generation.name} {years} {pull}kg {catalog_number}"
 *
 * For category 2 (bike_rack) and category 3 (standalone_wiring), the single
 * variant uses the product title as its variant title — those cases do NOT
 * call this helper (handled directly in their workflows).
 */
export function generateHookVariantTitle(params: {
  catalog: HookInput
  generation: GenerationInput
  variantCode: HookVariantCode
}): string {
  const { catalog, generation, variantCode } = params
  const suffix = VARIANT_SUFFIX[variantCode]
  const years = getYearsLabel(generation.year_from, generation.year_to)
  const brand = generation.vehicle_model.brand.name
  const model = generation.vehicle_model.name

  return `Hak holowniczy${suffix} ${brand} ${model} ${generation.name} ${years} ${catalog.pulling_capacity_kg}kg ${catalog.catalog_number}`
}
