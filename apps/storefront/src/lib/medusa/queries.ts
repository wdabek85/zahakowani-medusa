import { useQuery } from "@tanstack/react-query"
import { medusaFetch } from "./client"

/**
 * Vehicle fitment cascading queries — Brand → Model → Generation.
 * Used by VehicleSelectorHero (iter 5) and any other component needing the cascade.
 *
 * Backend endpoints (apps/medusa/src/api/store/vehicle-fitment/):
 *  - GET /brands                                   → list of brands
 *  - GET /brands/{brandCode}/models                → models for a brand (by CODE)
 *  - GET /models/{modelId}/generations             → generations for a model (by ID)
 */

export interface Brand {
  id: string
  code: string
  name: string
  logo_url: string | null
  product_count: number
}

export interface Model {
  id: string
  code: string
  name: string
  product_count: number
}

export interface Generation {
  id: string
  code: string
  name: string
  year_from: number | null
  year_to: number | null
  body_type: string | null
  years_label: string
  product_count: number
}

interface BrandsResponse {
  brands: Brand[]
}

interface ModelsResponse {
  brand: Pick<Brand, "id" | "code" | "name">
  models: Model[]
}

interface GenerationsResponse {
  brand: Pick<Brand, "id" | "code" | "name">
  model: Pick<Model, "id" | "code" | "name">
  generations: Generation[]
}

export function useBrands() {
  return useQuery({
    queryKey: ["vehicle-fitment", "brands"],
    queryFn: () => medusaFetch<BrandsResponse>("/store/vehicle-fitment/brands"),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.brands,
  })
}

export function useModels(brandCode: string | null) {
  return useQuery({
    queryKey: ["vehicle-fitment", "brands", brandCode, "models"],
    queryFn: () =>
      medusaFetch<ModelsResponse>(
        `/store/vehicle-fitment/brands/${brandCode}/models`,
      ),
    enabled: !!brandCode,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.models,
  })
}

export function useGenerations(modelId: string | null) {
  return useQuery({
    queryKey: ["vehicle-fitment", "models", modelId, "generations"],
    queryFn: () =>
      medusaFetch<GenerationsResponse>(
        `/store/vehicle-fitment/models/${modelId}/generations`,
      ),
    enabled: !!modelId,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.generations,
  })
}
