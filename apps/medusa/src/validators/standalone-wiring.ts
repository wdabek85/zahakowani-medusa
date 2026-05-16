import { z } from "zod"

const optionalString = z.string().max(500).optional().nullable()
const optionalUrl = z.string().url().max(500).optional().nullable()

export const createStandaloneWiringSchema = z.object({
  catalog_number: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  manufacturer: z.string().min(1).max(100),
  type: z.enum(["harness", "module"]),
  pin_count: z.coerce.number().int().refine((v) => v === 7 || v === 13, "pin_count must be 7 or 13"),
  weight_kg: z.number().int().positive(),
  has_fog_lights: z.boolean(),
  has_reverse_lights: z.boolean(),
  has_stop_lights: z.boolean(),
  has_indicators: z.boolean(),
  homologation: z.string().min(1).max(20),
  warranty_years: z.number().int().min(0).max(20).default(2),
  fits_all_vehicles: z.boolean(),
  description_html: z.string().min(1),
  short_description: optionalString,
  thumbnail: z.string().min(1).max(1000),
  gallery: z.array(z.string().min(1).max(1000)).default([]),
  installation_manual_url: optionalUrl,
})

export const updateStandaloneWiringSchema = createStandaloneWiringSchema.partial()

export const listStandaloneWiringsQuerySchema = z.object({
  q: z.string().optional(),
  manufacturer: z.string().optional(),
  type: z.enum(["harness", "module"]).optional(),
  pin_count: z.coerce.number().int().optional(),
  fits_all_vehicles: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
})

export type CreateStandaloneWiringInput = z.infer<typeof createStandaloneWiringSchema>
export type UpdateStandaloneWiringInput = z.infer<typeof updateStandaloneWiringSchema>
