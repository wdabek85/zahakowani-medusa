import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProductFromBikeRackWorkflow } from "../../../../workflows/create-product-from-bike-rack"
import { publishBikeRackSchema } from "../../../../validators/publish-bike-rack"
import { mapPublishError, PublishResponse } from "../_helpers"

/**
 * POST /admin/catalog/publish-bike-rack
 *
 * Body: PublishBikeRackInput. Triggers `createProductFromBikeRackWorkflow`
 * — single Product, single variant, no vehicle fitment.
 *
 * Brief #2 §2.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse<PublishResponse>) {
  try {
    const input = publishBikeRackSchema.parse(req.body)

    const { result } = await createProductFromBikeRackWorkflow(req.scope).run({
      input: {
        bikeRackId: input.bikeRackId,
        price: input.price,
        inventory: input.inventory,
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
