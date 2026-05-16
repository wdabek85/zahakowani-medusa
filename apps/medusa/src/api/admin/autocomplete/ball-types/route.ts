import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { filterUniqueSuggestions } from "../_helpers"

/**
 * GET /admin/autocomplete/ball-types?q={query}
 *
 * Returns unique `ball_type` values from Hook (the only model that has this field).
 * Brief #2 §9.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const q = req.query.q as string | undefined

  const { data: hooks } = await query.graph({
    entity: "hook",
    fields: ["ball_type"],
  })

  const all = (hooks as Array<{ ball_type: string }>).map((h) => h.ball_type)

  res.json({ suggestions: filterUniqueSuggestions(all, q) })
}
