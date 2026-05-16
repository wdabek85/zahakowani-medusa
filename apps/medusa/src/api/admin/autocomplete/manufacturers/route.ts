import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { filterUniqueSuggestions } from "../_helpers"

/**
 * GET /admin/autocomplete/manufacturers?q={query}
 *
 * Returns unique `manufacturer` values from Hook + BikeRack + StandaloneWiring.
 * Brief #2 §9.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const q = req.query.q as string | undefined

  const [{ data: hooks }, { data: bikeRacks }, { data: sws }] = await Promise.all([
    query.graph({ entity: "hook", fields: ["manufacturer"] }),
    query.graph({ entity: "bike_rack", fields: ["manufacturer"] }),
    query.graph({ entity: "standalone_wiring", fields: ["manufacturer"] }),
  ])

  const all = [
    ...(hooks as Array<{ manufacturer: string }>).map((h) => h.manufacturer),
    ...(bikeRacks as Array<{ manufacturer: string }>).map((b) => b.manufacturer),
    ...(sws as Array<{ manufacturer: string }>).map((s) => s.manufacturer),
  ]

  res.json({ suggestions: filterUniqueSuggestions(all, q) })
}
