import { z } from "zod"

const optionalString = z.string().max(500).optional().nullable()
const optionalUrl = z.string().url().max(500).optional().nullable()

export const createHookSchema = z.object({
  catalog_number: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  manufacturer: z.string().min(1).max(100),
  manufacturer_catalog_number: optionalString,
  pulling_capacity_kg: z.number().int().positive(),
  vertical_load_kg: z.number().int().positive(),
  homologation: z.string().min(1).max(20),
  ball_type: z.string().min(1).max(50),
  requires_bumper_cutting: z.boolean(),
  warranty_years: z.number().int().min(0).max(20).default(2),
  weight_kg: z.number().int().positive(),
  description_html: z.string().min(1),
  short_description: optionalString,
  thumbnail: z.string().min(1).max(1000),
  gallery: z.array(z.string().min(1).max(1000)).default([]),
  installation_manual_url: optionalUrl,
  certificate_url: optionalUrl,
})

export const updateHookSchema = createHookSchema.partial()

export const listHooksQuerySchema = z.object({
  q: z.string().optional(),
  manufacturer: z.string().optional(),
  homologation: z.string().optional(),
  ball_type: z.string().optional(),
  pulling_capacity_min: z.coerce.number().int().nonnegative().optional(),
  pulling_capacity_max: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  sort_by: z.enum(["created_at", "pulling_capacity_asc", "pulling_capacity_desc", "name"]).default("created_at"),
})

export type CreateHookInput = z.infer<typeof createHookSchema>
export type UpdateHookInput = z.infer<typeof updateHookSchema>
export type ListHooksQuery = z.infer<typeof listHooksQuerySchema>
