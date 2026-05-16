import { z } from "zod"

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createBrandSchema = z.object({
  code: z.string().regex(slugRegex, "Code: tylko małe litery, cyfry i myślniki").min(1).max(50),
  name: z.string().min(1).max(100),
  logo_url: z.string().url().optional().nullable(),
  display_order: z.number().int().nonnegative().default(0),
})

export const updateBrandSchema = createBrandSchema.partial()

export const createVehicleModelSchema = z.object({
  brand_id: z.string().min(1),
  code: z.string().regex(slugRegex, "Code: tylko małe litery, cyfry i myślniki").min(1).max(50),
  name: z.string().min(1).max(100),
  display_order: z.number().int().nonnegative().default(0),
})

export const updateVehicleModelSchema = createVehicleModelSchema.partial()

export const createGenerationSchema = z.object({
  vehicle_model_id: z.string().min(1),
  code: z.string().regex(slugRegex, "Code: tylko małe litery, cyfry i myślniki").min(1).max(50),
  name: z.string().min(1).max(100),
  year_from: z.number().int().min(1900).max(2100),
  year_to: z.number().int().min(1900).max(2100).optional().nullable(),
  body_type: z.string().min(1).max(50).optional().nullable(),
}).refine(
  (data) => data.year_to == null || data.year_to >= data.year_from,
  { message: "year_to musi być >= year_from (lub null dla 'obecnie')", path: ["year_to"] },
)

export const updateGenerationSchema = z.object({
  vehicle_model_id: z.string().min(1).optional(),
  code: z.string().regex(slugRegex).min(1).max(50).optional(),
  name: z.string().min(1).max(100).optional(),
  year_from: z.number().int().min(1900).max(2100).optional(),
  year_to: z.number().int().min(1900).max(2100).optional().nullable(),
  body_type: z.string().min(1).max(50).optional().nullable(),
})

export type CreateBrandInput = z.infer<typeof createBrandSchema>
export type CreateVehicleModelInput = z.infer<typeof createVehicleModelSchema>
export type CreateGenerationInput = z.infer<typeof createGenerationSchema>
