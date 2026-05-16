import { useQuery } from "@tanstack/react-query"

export type CatalogContext = {
  category: "hook" | "bike_rack" | "standalone_wiring" | null
  hook?: {
    id: string; catalog_number: string; name: string; manufacturer: string
    pulling_capacity_kg: number; vertical_load_kg: number
    homologation: string; ball_type: string; warranty_years: number
  }
  bike_rack?: {
    id: string; catalog_number: string; name: string; manufacturer: string
    max_bikes: number; max_total_load_kg: number; power_socket: string
  }
  standalone_wiring?: {
    id: string; catalog_number: string; name: string; manufacturer: string
    type: "harness" | "module"; pin_count: number
    fits_all_vehicles: boolean; homologation: string
  }
  generations: Array<{
    id: string; code: string; name: string
    years_label: string; body_type: string | null; vehicle_full_name: string
  }>
}

/**
 * Shared hook fetching catalog context for the product detail page widgets.
 * Single network round-trip serves all 4 widgets (cached by react-query).
 */
export const useCatalogContext = (productId: string) => {
  return useQuery({
    queryKey: ["admin-product-catalog-context", productId],
    queryFn: async (): Promise<CatalogContext> => {
      const r = await fetch(`/admin/products/${productId}/catalog-context`, { credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    },
    enabled: Boolean(productId),
  })
}
