import { z } from "zod"

const optionalString = z.string().max(500).optional().nullable()
const optionalUrl = z.string().url().max(500).optional().nullable()

export const createBikeRackSchema = z.object({
  catalog_number: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  manufacturer: z.string().min(1).max(100),
  max_bikes: z.number().int().positive(),
  max_bike_weight_kg: z.number().int().positive(),
  max_total_load_kg: z.number().int().positive(),
  power_socket: z.enum(["7-pin", "13-pin"]),
  weight_kg: z.number().int().positive(),
  length_cm: z.number().int().positive(),
  has_lockable_attachment: z.boolean(),
  has_rear_lights: z.boolean(),
  has_tilt_function: z.boolean(),
  tool_free_assembly: z.boolean(),
  warranty_years: z.number().int().min(0).max(20).default(2),
  description_html: z.string().min(1),
  short_description: optionalString,
  thumbnail: z.string().min(1).max(1000),
  gallery: z.array(z.string().min(1).max(1000)).default([]),
  installation_manual_url: optionalUrl,
})

export const updateBikeRackSchema = createBikeRackSchema.partial()

export const listBikeRacksQuerySchema = z.object({
  q: z.string().optional(),
  manufacturer: z.string().optional(),
  max_bikes: z.coerce.number().int().positive().optional(),
  has_tilt_function: z.coerce.boolean().optional(),
  max_total_load_min: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  sort_by: z.enum(["created_at", "max_bikes_desc", "name"]).default("created_at"),
})

export type CreateBikeRackInput = z.infer<typeof createBikeRackSchema>
export type UpdateBikeRackInput = z.infer<typeof updateBikeRackSchema>
