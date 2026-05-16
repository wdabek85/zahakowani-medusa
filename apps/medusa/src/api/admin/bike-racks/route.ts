import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { BIKE_RACK_CATALOG_MODULE } from "../../../modules/bike-rack-catalog"
import BikeRackCatalogService from "../../../modules/bike-rack-catalog/service"
import { createBikeRackSchema, listBikeRacksQuerySchema } from "../../../validators/bike-rack"

type BikeRackRow = {
  id: string
  catalog_number: string
  name: string
  manufacturer: string
  max_bikes: number
  max_total_load_kg: number
  has_tilt_function: boolean
  power_socket: string
  weight_kg: number
  created_at: string
}

/** GET /admin/bike-racks — listing z filtrami + paginacja. Brief #2 §4.1. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = listBikeRacksQuerySchema.parse(req.query)
    const service = req.scope.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)

    const filters: Record<string, unknown> = {}
    if (query.manufacturer) filters.manufacturer = query.manufacturer
    if (query.max_bikes !== undefined) filters.max_bikes = query.max_bikes

    const all = (await service.listBikeRacks(filters, { take: 1000 })) as BikeRackRow[]

    let filtered = all
    if (query.has_tilt_function !== undefined) {
      filtered = filtered.filter((b) => b.has_tilt_function === query.has_tilt_function)
    }
    if (query.max_total_load_min !== undefined) {
      filtered = filtered.filter((b) => b.max_total_load_kg >= query.max_total_load_min!)
    }
    if (query.q) {
      const q = query.q.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.catalog_number.toLowerCase().includes(q)
          || b.name.toLowerCase().includes(q)
          || b.manufacturer.toLowerCase().includes(q),
      )
    }

    filtered.sort((a, b) => {
      if (query.sort_by === "max_bikes_desc") return b.max_bikes - a.max_bikes
      if (query.sort_by === "name") return a.name.localeCompare(b.name, "pl")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    res.json({
      bike_racks: filtered.slice(query.offset, query.offset + query.limit),
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

/** POST /admin/bike-racks — create. Brief #2 §4.2. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const input = createBikeRackSchema.parse(req.body)
    const service = req.scope.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)
    const [bikeRack] = await service.createBikeRacks([input])
    res.status(201).json({ bike_rack: bikeRack })
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
