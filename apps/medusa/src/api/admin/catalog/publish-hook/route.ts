import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProductFromHookWorkflow } from "../../../../workflows/create-product-from-hook"
import { publishHookSchema } from "../../../../validators/publish-hook"
import { mapPublishError, PublishResponse } from "../_helpers"

/**
 * POST /admin/catalog/publish-hook
 *
 * Body: PublishHookInput (validated by Zod). Triggers `createProductFromHookWorkflow`
 * with one Product per generationId (5 variants each: BARE/W7/W13/M7/M13).
 *
 * Brief #2 §2.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse<PublishResponse>) {
  try {
    const input = publishHookSchema.parse(req.body)

    const { result } = await createProductFromHookWorkflow(req.scope).run({
      input: {
        hookId: input.hookId,
        generationIds: input.generationIds,
        variantPrices: input.variantPrices,
        variantInventory: input.variantInventory,
        status: input.status,
        currencyCode: input.currencyCode,
      },
    })

    res.json({
      success: true,
      productsCreated: result.length,
      productIds: result.map((p) => p.id),
    })
  } catch (err) {
    const { status, body } = mapPublishError(err)
    res.status(status).json(body)
  }
}
