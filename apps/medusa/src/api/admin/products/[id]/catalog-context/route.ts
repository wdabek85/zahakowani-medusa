import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/products/:id/catalog-context
 *
 * Returns the linked catalog entity (hook | bike_rack | standalone_wiring) and
 * the list of fitment generations for the given product. Used by the 4 admin
 * widgets on the Medusa product detail page (brief #2 §§11-12).
 *
 * Shape:
 *  {
 *    category: "hook" | "bike_rack" | "standalone_wiring" | null,
 *    hook?:              { id, catalog_number, name, manufacturer, pulling_capacity_kg,
 *                          vertical_load_kg, homologation, ball_type, warranty_years },
 *    bike_rack?:         { id, catalog_number, name, manufacturer, max_bikes,
 *                          max_total_load_kg, power_socket },
 *    standalone_wiring?: { id, catalog_number, name, manufacturer, type, pin_count,
 *                          fits_all_vehicles, homologation },
 *    generations: Array<{ id, code, name, years_label, vehicle_full_name }>
 *  }
 */
export async function GET(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productId = req.params.id

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "hook.id", "hook.catalog_number", "hook.name", "hook.manufacturer",
      "hook.pulling_capacity_kg", "hook.vertical_load_kg",
      "hook.homologation", "hook.ball_type", "hook.warranty_years",
      "bike_rack.id", "bike_rack.catalog_number", "bike_rack.name",
      "bike_rack.manufacturer", "bike_rack.max_bikes",
      "bike_rack.max_total_load_kg", "bike_rack.power_socket",
      "standalone_wiring.id", "standalone_wiring.catalog_number",
      "standalone_wiring.name", "standalone_wiring.manufacturer",
      "standalone_wiring.type", "standalone_wiring.pin_count",
      "standalone_wiring.fits_all_vehicles", "standalone_wiring.homologation",
      "generations.id", "generations.code", "generations.name",
      "generations.year_from", "generations.year_to", "generations.body_type",
      "generations.vehicle_model.name", "generations.vehicle_model.brand.name",
    ],
    filters: { id: productId },
  })

  if (!products.length) {
    res.status(404).json({ error: `Product "${productId}" not found` })
    return
  }

  type ProductRow = {
    id: string
    hook?: unknown | unknown[]
    bike_rack?: unknown | unknown[]
    standalone_wiring?: unknown | unknown[]
    generations?: Array<{
      id: string; code: string; name: string; year_from: number; year_to: number | null; body_type: string | null
      vehicle_model: { name: string; brand: { name: string } }
    }>
  }

  const p = products[0] as ProductRow

  const hook = Array.isArray(p.hook) ? p.hook[0] : p.hook
  const bikeRack = Array.isArray(p.bike_rack) ? p.bike_rack[0] : p.bike_rack
  const standaloneWiring = Array.isArray(p.standalone_wiring) ? p.standalone_wiring[0] : p.standalone_wiring

  let category: "hook" | "bike_rack" | "standalone_wiring" | null = null
  if (hook) category = "hook"
  else if (bikeRack) category = "bike_rack"
  else if (standaloneWiring) category = "standalone_wiring"

  const generations = (p.generations ?? []).map((g) => {
    const yearsLabel = g.year_to ? `${g.year_from}-${g.year_to}` : `${g.year_from}-obecnie`
    return {
      id: g.id,
      code: g.code,
      name: g.name,
      years_label: yearsLabel,
      body_type: g.body_type,
      vehicle_full_name: `${g.vehicle_model.brand.name} ${g.vehicle_model.name} ${g.name} ${yearsLabel}`,
    }
  })

  res.json({
    category,
    hook: hook ?? undefined,
    bike_rack: bikeRack ?? undefined,
    standalone_wiring: standaloneWiring ?? undefined,
    generations,
  })
}
