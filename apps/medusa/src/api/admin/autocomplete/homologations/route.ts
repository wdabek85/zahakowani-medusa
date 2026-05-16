import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { filterUniqueSuggestions } from "../_helpers"

/**
 * GET /admin/autocomplete/homologations?q={query}
 *
 * Returns unique `homologation` values from Hook + StandaloneWiring + WiringEquipment.
 * Brief #2 §9.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const q = req.query.q as string | undefined

  const [{ data: hooks }, { data: sws }, { data: wirings }] = await Promise.all([
    query.graph({ entity: "hook", fields: ["homologation"] }),
    query.graph({ entity: "standalone_wiring", fields: ["homologation"] }),
    query.graph({ entity: "wiring_equipment", fields: ["homologation"] }),
  ])

  const all = [
    ...(hooks as Array<{ homologation: string }>).map((h) => h.homologation),
    ...(sws as Array<{ homologation: string }>).map((s) => s.homologation),
    ...(wirings as Array<{ homologation: string }>).map((w) => w.homologation),
  ]

  res.json({ suggestions: filterUniqueSuggestions(all, q) })
}
