import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProductFromStandaloneWiringWorkflow } from "../../../../workflows/create-product-from-standalone-wiring"
import { publishStandaloneWiringSchema } from "../../../../validators/publish-standalone-wiring"
import { mapPublishError, PublishResponse } from "../_helpers"

/**
 * POST /admin/catalog/publish-standalone-wiring
 *
 * Body: PublishStandaloneWiringInput. Triggers `createProductFromStandaloneWiringWorkflow`
 * which branches on `fits_all_vehicles`:
 *  - true → 1 universal Product (generationIds must be empty/omitted)
 *  - false → N Products (one per generationId, which is required)
 *
 * The workflow itself validates the fits_all_vehicles ↔ generationIds invariant
 * and throws `INVALID_DATA` on mismatch.
 *
 * Brief #2 §2.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse<PublishResponse>) {
  try {
    const input = publishStandaloneWiringSchema.parse(req.body)

    const { result } = await createProductFromStandaloneWiringWorkflow(req.scope).run({
      input: {
        wiringId: input.wiringId,
        generationIds: input.generationIds,
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
