import { z } from "zod"

const variantPriceSchema = z.object({
  BARE: z.number().nonnegative(),
  W7: z.number().nonnegative(),
  W13: z.number().nonnegative(),
  M7: z.number().nonnegative(),
  M13: z.number().nonnegative(),
})

const variantInventorySchema = z
  .object({
    BARE: z.number().int().nonnegative().optional(),
    W7: z.number().int().nonnegative().optional(),
    W13: z.number().int().nonnegative().optional(),
    M7: z.number().int().nonnegative().optional(),
    M13: z.number().int().nonnegative().optional(),
  })
  .optional()

export const publishHookSchema = z.object({
  hookId: z.string().min(1),
  generationIds: z.array(z.string().min(1)).min(1),
  variantPrices: variantPriceSchema,
  variantInventory: variantInventorySchema,
  status: z.enum(["draft", "published"]).default("draft"),
  currencyCode: z.string().length(3).optional(),
})

export type PublishHookInput = z.infer<typeof publishHookSchema>
