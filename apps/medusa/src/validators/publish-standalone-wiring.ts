import { z } from "zod"

/**
 * The endpoint enforces the `fits_all_vehicles` semantics at the workflow level
 * (load step checks the wiring and rejects if generationIds doesn't match the
 * fits_all_vehicles flag). Here we only validate that the shape is sane —
 * generationIds is always optional in the request body.
 */
export const publishStandaloneWiringSchema = z.object({
  wiringId: z.string().min(1),
  generationIds: z.array(z.string().min(1)).optional(),
  price: z.number().nonnegative(),
  inventory: z.number().int().nonnegative().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  currencyCode: z.string().length(3).optional(),
})

export type PublishStandaloneWiringInput = z.infer<typeof publishStandaloneWiringSchema>
