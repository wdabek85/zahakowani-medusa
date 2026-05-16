import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"
import { HOOK_CATALOG_MODULE } from "../../../../modules/hook-catalog"
import HookCatalogService from "../../../../modules/hook-catalog/service"
import { updateHookSchema } from "../../../../validators/hook"

/**
 * GET /admin/hooks/:id
 *
 * Returns the hook + linked Generations + Products that link to this hook.
 * The edit page (brief #2 §3.3) uses generations for the "Pasujące pojazdy"
 * panel and products for the "Wystawione produkty" panel.
 */
export async function GET(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const hooks = req.scope.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let hook
  try {
    hook = await hooks.retrieveHook(req.params.id)
  } catch {
    res.status(404).json({ error: `Hook with id "${req.params.id}" not found` })
    return
  }

  // Products that link to this hook (+ their generations for fitment view)
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id", "title", "handle", "status", "thumbnail",
      "hook.id",
      "generations.id", "generations.code", "generations.name",
      "generations.year_from", "generations.year_to",
      "generations.vehicle_model.name", "generations.vehicle_model.brand.name",
    ],
    filters: { status: ["draft", "published"] },
  })

  type ProductRow = {
    id: string; title: string; handle: string; status: string; thumbnail: string | null
    hook?: { id: string } | Array<{ id: string }> | null
    generations?: Array<{
      id: string; code: string; name: string; year_from: number; year_to: number | null
      vehicle_model: { name: string; brand: { name: string } }
    }>
  }

  const linkedProducts = (products as ProductRow[]).filter((p) => {
    const h = Array.isArray(p.hook) ? p.hook[0] : p.hook
    return h && h.id === hook.id
  })

  // Aggregate distinct generations across all linked products
  const generationsMap = new Map<string, {
    id: string; code: string; name: string; year_from: number; year_to: number | null
    years_label: string; vehicle_full_name: string
  }>()
  for (const p of linkedProducts) {
    for (const g of p.generations ?? []) {
      if (generationsMap.has(g.id)) continue
      const yearsLabel = g.year_to ? `${g.year_from}-${g.year_to}` : `${g.year_from}-obecnie`
      generationsMap.set(g.id, {
        id: g.id, code: g.code, name: g.name, year_from: g.year_from, year_to: g.year_to,
        years_label: yearsLabel,
        vehicle_full_name: `${g.vehicle_model.brand.name} ${g.vehicle_model.name} ${g.name} ${yearsLabel}`,
      })
    }
  }

  res.json({
    hook,
    generations: Array.from(generationsMap.values()),
    products: linkedProducts.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      status: p.status,
      thumbnail: p.thumbnail,
    })),
  })
}

/**
 * PATCH /admin/hooks/:id
 *
 * Partial update of a hook entry. Brief #2 §3.3.
 */
export async function PATCH(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  try {
    const input = updateHookSchema.parse(req.body)
    const hooks = req.scope.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)
    const hook = await hooks.updateHooks({ id: req.params.id, ...input })
    res.json({ hook })
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.issues })
      return
    }
    if (err instanceof MedusaError && err.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({ error: err.message })
      return
    }
    throw err
  }
}

/**
 * DELETE /admin/hooks/:id
 *
 * Soft-deletes the hook. Linked Products and their links remain — the admin
 * can clean those up separately if needed.
 */
export async function DELETE(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse,
) {
  const hooks = req.scope.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)
  try {
    await hooks.deleteHooks([req.params.id])
    res.json({ id: req.params.id, deleted: true })
  } catch (err) {
    if (err instanceof MedusaError && err.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({ error: err.message })
      return
    }
    throw err
  }
}
