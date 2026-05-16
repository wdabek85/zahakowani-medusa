/**
 * Shared types for catalog utility functions.
 *
 * These types describe the minimal shape of catalog entities consumed by
 * the title/SKU/handle generators. They are deliberately structural (not
 * imported from module models) so that the utils stay decoupled from the
 * persistence layer — pure functions, easy to test.
 */

export type CatalogCategory = "hook" | "bike_rack" | "standalone_wiring"

export type HookVariantCode = "BARE" | "W7" | "W13" | "M7" | "M13"

export type GenerationInput = {
  name: string
  code: string
  year_from: number
  year_to: number | null
  vehicle_model: {
    name: string
    code: string
    brand: {
      name: string
      code: string
    }
  }
}

export type HookInput = {
  catalog_number: string
  pulling_capacity_kg: number
}

export type BikeRackInput = {
  catalog_number: string
  name: string
  manufacturer: string
  max_bikes: number
}

export type StandaloneWiringInput = {
  catalog_number: string
  name: string
  manufacturer: string
  type: "harness" | "module"
  pin_count: number
  fits_all_vehicles: boolean
}
