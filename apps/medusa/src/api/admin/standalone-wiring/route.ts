import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { STANDALONE_WIRING_CATALOG_MODULE } from "../../../modules/standalone-wiring-catalog"
import StandaloneWiringCatalogService from "../../../modules/standalone-wiring-catalog/service"
import { createStandaloneWiringSchema, listStandaloneWiringsQuerySchema } from "../../../validators/standalone-wiring"

type SwRow = {
  id: string; catalog_number: string; name: string; manufacturer: string
  type: string; pin_count: number; fits_all_vehicles: boolean
  homologation: string; created_at: string
}

/** GET /admin/standalone-wiring — listing z filtrami. Brief #2 §5.1. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = listStandaloneWiringsQuerySchema.parse(req.query)
    const service = req.scope.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)

    const filters: Record<string, unknown> = {}
    if (query.manufacturer) filters.manufacturer = query.manufacturer
    if (query.type) filters.type = query.type
    if (query.pin_count !== undefined) filters.pin_count = query.pin_count
    if (query.fits_all_vehicles !== undefined) filters.fits_all_vehicles = query.fits_all_vehicles

    const all = (await service.listStandaloneWirings(filters, { take: 1000 })) as SwRow[]

    let filtered = all
    if (query.q) {
      const q = query.q.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.catalog_number.toLowerCase().includes(q)
          || s.name.toLowerCase().includes(q)
          || s.manufacturer.toLowerCase().includes(q),
      )
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    res.json({
      standalone_wirings: filtered.slice(query.offset, query.offset + query.limit),
      count: filtered.length,
      limit: query.limit,
      offset: query.offset,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid query", details: err.issues })
      return
    }
    throw err
  }
}

/** POST /admin/standalone-wiring — create. Brief #2 §5.2. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const input = createStandaloneWiringSchema.parse(req.body)
    const service = req.scope.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)
    const [sw] = await service.createStandaloneWirings([input])
    res.status(201).json({ standalone_wiring: sw })
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
