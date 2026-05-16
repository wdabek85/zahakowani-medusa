import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { HOOK_CATALOG_MODULE } from "../../../modules/hook-catalog"
import HookCatalogService from "../../../modules/hook-catalog/service"
import { createHookSchema, listHooksQuerySchema } from "../../../validators/hook"

type HookRow = {
  id: string
  catalog_number: string
  name: string
  manufacturer: string
  ball_type: string
  homologation: string
  pulling_capacity_kg: number
  vertical_load_kg: number
  weight_kg: number
  warranty_years: number
  requires_bumper_cutting: boolean
  thumbnail: string
  created_at: string
}

/**
 * GET /admin/hooks
 *
 * Listing with filters + pagination + sort. Brief #2 §3.1.
 *
 * Range filters (`pulling_capacity_min/max`) applied JS-side after the base
 * service query — see `tech-stack-guidelines.md` §26.8 (MVP-acceptable;
 * refactor to native operators when Medusa supports them in stable).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = listHooksQuerySchema.parse(req.query)
    const hooks = req.scope.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)

    const filters: Record<string, unknown> = {}
    if (query.manufacturer) filters.manufacturer = query.manufacturer
    if (query.homologation) filters.homologation = query.homologation
    if (query.ball_type) filters.ball_type = query.ball_type

    const allMatching = (await hooks.listHooks(filters, { take: 1000 })) as HookRow[]

    let filtered = allMatching
    if (query.pulling_capacity_min !== undefined) {
      filtered = filtered.filter((h) => h.pulling_capacity_kg >= query.pulling_capacity_min!)
    }
    if (query.pulling_capacity_max !== undefined) {
      filtered = filtered.filter((h) => h.pulling_capacity_kg <= query.pulling_capacity_max!)
    }
    if (query.q) {
      const q = query.q.toLowerCase()
      filtered = filtered.filter(
        (h) =>
          h.catalog_number.toLowerCase().includes(q)
          || h.name.toLowerCase().includes(q)
          || h.manufacturer.toLowerCase().includes(q),
      )
    }

    filtered.sort((a, b) => {
      if (query.sort_by === "pulling_capacity_asc") return a.pulling_capacity_kg - b.pulling_capacity_kg
      if (query.sort_by === "pulling_capacity_desc") return b.pulling_capacity_kg - a.pulling_capacity_kg
      if (query.sort_by === "name") return a.name.localeCompare(b.name, "pl")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    const total = filtered.length
    const page = filtered.slice(query.offset, query.offset + query.limit)

    res.json({ hooks: page, count: total, limit: query.limit, offset: query.offset })
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid query", details: err.issues })
      return
    }
    throw err
  }
}

/**
 * POST /admin/hooks
 *
 * Creates a new Hook catalog entry. Brief #2 §3.2.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const input = createHookSchema.parse(req.body)
    const hooks = req.scope.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)
    const [hook] = await hooks.createHooks([input])
    res.status(201).json({ hook })
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.issues })
      return
    }
    if (err instanceof MedusaError && err.type === MedusaError.Types.CONFLICT) {
      res.status(409).json({ error: err.message })
      return
    }
    if (err instanceof Error && err.message.includes("already exists")) {
      res.status(409).json({ error: err.message })
      return
    }
    throw err
  }
}
