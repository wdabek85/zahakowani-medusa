import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import { HOOK_CATALOG_MODULE } from "../modules/hook-catalog"
import { createProductFromHookWorkflow } from "../workflows/create-product-from-hook"
import VehicleFitmentService from "../modules/vehicle-fitment/service"
import HookCatalogService from "../modules/hook-catalog/service"

const PUBLISHABLE_KEY = "pk_c1af8bc88b01b77c342f35f62974d63d97c4ef7eb064927ba0d3fb1098947c93"
const BASE = "http://localhost:9000"

async function apiGet(path: string): Promise<{ status: number; body: unknown }> {
  const r = await fetch(`${BASE}${path}`, {
    headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
  })
  return { status: r.status, body: await r.json() }
}

export default async function testVehicleFitmentApi({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fitment = container.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  const hooks = container.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)
  const productModule = container.resolve(Modules.PRODUCT)

  const cleanup: Array<() => Promise<void>> = []
  const createdProductIds: string[] = []
  let failures = 0

  const check = (label: string, ok: boolean, detail?: string) => {
    if (ok) logger.info(`  ✔ ${label}`)
    else { logger.error(`  ✘ ${label}${detail ? `: ${detail}` : ""}`); failures++ }
  }

  try {
    logger.info("=== Setup: Brand → Model → Generation + Hook + published product ===")
    const [brand] = await fitment.createBrands([{ code: "api-skoda", name: "API Skoda", display_order: 1 }])
    cleanup.push(async () => { await fitment.deleteBrands([brand.id]) })

    const [model] = await fitment.createVehicleModels([{
      code: "api-octavia", name: "API Octavia", display_order: 0, brand_id: brand.id,
    }])
    cleanup.push(async () => { await fitment.deleteVehicleModels([model.id]) })

    const [gen] = await fitment.createGenerations([{
      code: "api-octavia-3", name: "API Octavia 3", year_from: 2013, year_to: 2019,
      body_type: "Kombi", vehicle_model_id: model.id,
    }])
    cleanup.push(async () => { await fitment.deleteGenerations([gen.id]) })

    const [hook] = await hooks.createHooks([{
      catalog_number: "API/Z/001", name: "API Hak", manufacturer: "API Manuf",
      pulling_capacity_kg: 1800, vertical_load_kg: 98, homologation: "E20",
      ball_type: "Odkręcana", requires_bumper_cutting: false, warranty_years: 2,
      weight_kg: 10, description_html: "<p>api</p>", thumbnail: "",
      gallery: [], short_description: null, manufacturer_catalog_number: null,
      installation_manual_url: null, certificate_url: null,
    }])
    cleanup.push(async () => { await hooks.deleteHooks([hook.id]) })

    const { result: products } = await createProductFromHookWorkflow(container).run({
      input: {
        hookId: hook.id, generationIds: [gen.id],
        variantPrices: { BARE: 420, W7: 480, W13: 530, M7: 580, M13: 700 },
        status: "published",
      },
    })
    products.forEach((p) => createdProductIds.push(p.id))
    logger.info(`Created ${products.length} published product(s)`)

    // ────────────────────────────────────────────────────────────
    logger.info("=== TEST 1: GET /store/vehicle-fitment/brands ===")
    const r1 = await apiGet("/store/vehicle-fitment/brands")
    check("status 200", r1.status === 200, `got ${r1.status}`)
    const r1b = r1.body as { brands?: Array<{ code: string; product_count: number }> }
    const apiSkoda = r1b.brands?.find((b) => b.code === "api-skoda")
    check("api-skoda brand present", Boolean(apiSkoda))
    check("api-skoda product_count >= 1", (apiSkoda?.product_count ?? 0) >= 1, `got ${apiSkoda?.product_count}`)

    // ────────────────────────────────────────────────────────────
    logger.info("=== TEST 2: GET /store/vehicle-fitment/brands/api-skoda/models ===")
    const r2 = await apiGet("/store/vehicle-fitment/brands/api-skoda/models")
    check("status 200", r2.status === 200, `got ${r2.status}`)
    const r2b = r2.body as { brand?: { code: string }; models?: Array<{ code: string; product_count: number }> }
    check("brand.code = api-skoda", r2b.brand?.code === "api-skoda")
    check("model api-octavia present", Boolean(r2b.models?.find((m) => m.code === "api-octavia")))
    check("model product_count >= 1", (r2b.models?.find((m) => m.code === "api-octavia")?.product_count ?? 0) >= 1)

    // ────────────────────────────────────────────────────────────
    logger.info(`=== TEST 3: GET /store/vehicle-fitment/models/${model.id}/generations ===`)
    const r3 = await apiGet(`/store/vehicle-fitment/models/${model.id}/generations`)
    check("status 200", r3.status === 200, `got ${r3.status}`)
    const r3b = r3.body as { generations?: Array<{ code: string; years_label: string; product_count: number }> }
    const apiGen = r3b.generations?.find((g) => g.code === "api-octavia-3")
    check("generation api-octavia-3 present", Boolean(apiGen))
    check("years_label = 2013-2019", apiGen?.years_label === "2013-2019", `got "${apiGen?.years_label}"`)
    check("generation product_count >= 1", (apiGen?.product_count ?? 0) >= 1)

    // ────────────────────────────────────────────────────────────
    logger.info("=== TEST 4: GET /store/vehicle-fitment/lookup ===")
    const r4 = await apiGet("/store/vehicle-fitment/lookup")
    check("status 200", r4.status === 200, `got ${r4.status}`)
    const r4b = r4.body as { brands?: Array<{ code: string; models?: Array<{ code: string; generations?: Array<{ code: string }> }> }> }
    const lookupBrand = r4b.brands?.find((b) => b.code === "api-skoda")
    check("api-skoda in lookup", Boolean(lookupBrand))
    const lookupModel = lookupBrand?.models?.find((m) => m.code === "api-octavia")
    check("api-octavia in lookup", Boolean(lookupModel))
    check("generation in lookup", Boolean(lookupModel?.generations?.find((g) => g.code === "api-octavia-3")))

    // ────────────────────────────────────────────────────────────
    logger.info(`=== TEST 5: GET /store/products/by-vehicle/${gen.id} ===`)
    const r5 = await apiGet(`/store/products/by-vehicle/${gen.id}`)
    check("status 200", r5.status === 200, `got ${r5.status}`)
    const r5b = r5.body as { hooks?: unknown[]; standalone_wiring?: unknown[]; bike_racks?: unknown[]; totals?: { hooks: number } }
    check("hooks array present", Array.isArray(r5b.hooks))
    check("hooks.length >= 1 (we created 1 hook product)", (r5b.hooks?.length ?? 0) >= 1, `got ${r5b.hooks?.length}`)
    check("standalone_wiring array present", Array.isArray(r5b.standalone_wiring))
    check("bike_racks array present", Array.isArray(r5b.bike_racks))
    check("totals.hooks >= 1", (r5b.totals?.hooks ?? 0) >= 1)

    // ────────────────────────────────────────────────────────────
    logger.info("=== TEST 6: 404 for unknown brand ===")
    const r6 = await apiGet("/store/vehicle-fitment/brands/does-not-exist/models")
    check("status 404", r6.status === 404, `got ${r6.status}`)

    if (failures === 0) {
      logger.info("=== ALL API TESTS PASSED ===")
    } else {
      logger.error(`=== ${failures} failure(s) ===`)
    }
  } finally {
    logger.info("=== Cleanup ===")
    if (createdProductIds.length) {
      try { await productModule.deleteProducts(createdProductIds) } catch (e) { logger.error(`del products: ${(e as Error).message}`) }
    }
    for (const fn of cleanup.reverse()) { try { await fn() } catch {} }
    logger.info("Cleanup done.")
  }
}
