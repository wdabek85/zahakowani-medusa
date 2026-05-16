import { z } from "zod"

export const publishBikeRackSchema = z.object({
  bikeRackId: z.string().min(1),
  price: z.number().nonnegative(),
  inventory: z.number().int().nonnegative().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  currencyCode: z.string().length(3).optional(),
})

export type PublishBikeRackInput = z.infer<typeof publishBikeRackSchema>
