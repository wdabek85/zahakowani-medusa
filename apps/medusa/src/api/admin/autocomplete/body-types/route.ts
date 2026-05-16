import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { filterUniqueSuggestions } from "../_helpers"

/**
 * GET /admin/autocomplete/body-types?q={query}
 *
 * Returns unique `body_type` values from Generation
 * (e.g. "Kombi", "Sedan", "SUV", "Hatchback").
 * Brief #2 §9.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const q = req.query.q as string | undefined

  const { data: generations } = await query.graph({
    entity: "generation",
    fields: ["body_type"],
  })

  const all = (generations as Array<{ body_type: string | null }>).map((g) => g.body_type)

  res.json({ suggestions: filterUniqueSuggestions(all, q) })
}
