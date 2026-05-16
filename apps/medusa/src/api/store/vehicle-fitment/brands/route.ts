import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/vehicle-fitment/brands
 *
 * Returns all brands with product counts. Brief #1 §10.
 *
 * Product count is computed by querying generations (with their `products` link)
 * and aggregating up to the brand. Doing the join from the Brand side via deep
 * field selection triggers a Medusa link-resolver issue in 2.15.2 ("Cannot read
 * properties of undefined (reading 'strategy')").
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const [{ data: brands }, { data: generations }] = await Promise.all([
    query.graph({
      entity: "brand",
      fields: ["id", "code", "name", "logo_url", "display_order"],
    }),
    query.graph({
      entity: "generation",
      fields: [
        "id",
        "vehicle_model.id",
        "vehicle_model.brand.id",
        "products.id",
      ],
    }),
  ])

  type GenRow = {
    id: string
    vehicle_model: { id: string; brand: { id: string } | Array<{ id: string }> } | Array<{ id: string; brand: { id: string } | Array<{ id: string }> }>
    products?: Array<{ id: string }>
  }

  const productsByBrandId = new Map<string, Set<string>>()
  for (const g of generations as GenRow[]) {
    const vm = Array.isArray(g.vehicle_model) ? g.vehicle_model[0] : g.vehicle_model
    if (!vm) continue
    const br = Array.isArray(vm.brand) ? vm.brand[0] : vm.brand
    if (!br) continue
    const set = productsByBrandId.get(br.id) ?? new Set<string>()
    for (const p of g.products ?? []) set.add(p.id)
    productsByBrandId.set(br.id, set)
  }

  type BrandRow = { id: string; code: string; name: string; logo_url: string | null; display_order: number }

  const result = (brands as BrandRow[])
    .map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      logo_url: b.logo_url,
      product_count: productsByBrandId.get(b.id)?.size ?? 0,
    }))
    .sort((a, b) => {
      const ao = brands.find((x) => x.id === a.id)?.display_order ?? 0
      const bo = brands.find((x) => x.id === b.id)?.display_order ?? 0
      return ao - bo || a.name.localeCompare(b.name)
    })

  res.json({ brands: result })
}
