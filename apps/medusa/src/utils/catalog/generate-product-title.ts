import {
  CatalogCategory,
  GenerationInput,
  HookInput,
  BikeRackInput,
  StandaloneWiringInput,
} from "./types"
import { getYearsLabel } from "./years-label"

type GenerateProductTitleParams =
  | {
      category: "hook"
      catalog: HookInput
      generation: GenerationInput
    }
  | {
      category: "bike_rack"
      catalog: BikeRackInput
    }
  | {
      category: "standalone_wiring"
      catalog: StandaloneWiringInput
      generation?: GenerationInput
    }

/**
 * Builds a product title for the given category, per brief #1 §8.
 *
 * Templates:
 *  - hook:               "Hak holowniczy {brand} {model} {generation.name} {years} {pull}kg {catalog_number}"
 *  - bike_rack:          "{manufacturer} {name} - bagażnik rowerowy na hak {max_bikes} rowery {catalog_number}"
 *  - standalone_wiring (universal):   "{manufacturer} {name} {type_label} {pin}-Pin uniwersalny {catalog_number}"
 *  - standalone_wiring (per-gen):     "{manufacturer} {name} {type_label} {pin}-Pin {brand} {model} {years} {catalog_number}"
 *
 * @throws Error if `standalone_wiring` is per-generation but no `generation` provided.
 */
export function generateProductTitle(params: GenerateProductTitleParams): string {
  if (params.category === "hook") {
    const { catalog, generation } = params
    const years = getYearsLabel(generation.year_from, generation.year_to)
    const brand = generation.vehicle_model.brand.name
    const model = generation.vehicle_model.name
    return `Hak holowniczy ${brand} ${model} ${generation.name} ${years} ${catalog.pulling_capacity_kg}kg ${catalog.catalog_number}`
  }

  if (params.category === "bike_rack") {
    const { catalog } = params
    return `${catalog.manufacturer} ${catalog.name} - bagażnik rowerowy na hak ${catalog.max_bikes} rowery ${catalog.catalog_number}`
  }

  // standalone_wiring
  const { catalog, generation } = params
  const typeLabel = catalog.type === "module" ? "Moduł" : "Wiązka"

  if (catalog.fits_all_vehicles) {
    return `${catalog.manufacturer} ${catalog.name} ${typeLabel} ${catalog.pin_count}-Pin uniwersalny ${catalog.catalog_number}`
  }

  if (!generation) {
    throw new Error(
      `generateProductTitle: standalone_wiring "${catalog.catalog_number}" with fits_all_vehicles=false requires a generation`,
    )
  }

  const years = getYearsLabel(generation.year_from, generation.year_to)
  const brand = generation.vehicle_model.brand.name
  const model = generation.vehicle_model.name
  return `${catalog.manufacturer} ${catalog.name} ${typeLabel} ${catalog.pin_count}-Pin ${brand} ${model} ${years} ${catalog.catalog_number}`
}

// Re-export for use by other utils
export type { GenerateProductTitleParams }
export { CatalogCategory } from "./types"
