import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import { HOOK_CATALOG_MODULE } from "../modules/hook-catalog"
import { BIKE_RACK_CATALOG_MODULE } from "../modules/bike-rack-catalog"
import { STANDALONE_WIRING_CATALOG_MODULE } from "../modules/standalone-wiring-catalog"
import { createProductFromHookWorkflow } from "../workflows/create-product-from-hook"
import { createProductFromBikeRackWorkflow } from "../workflows/create-product-from-bike-rack"
import { createProductFromStandaloneWiringWorkflow } from "../workflows/create-product-from-standalone-wiring"

const PUBLISHABLE_KEY = "pk_c1af8bc88b01b77c342f35f62974d63d97c4ef7eb064927ba0d3fb1098947c93"
const BASE = "http://localhost:9000"

async function apiGet(path: string): Promise<{ status: number; body: unknown }> {
  const r = await fetch(`${BASE}${path}`, {
    headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
  })
  return { status: r.status, body: await r.json() }
}

export default async function testListingLandingApi({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fitment = container.resolve(VEHICLE_FITMENT_MODULE)
  const hooks = container.resolve(HOOK_CATALOG_MODULE)
  const bikeRacks = container.resolve(BIKE_RACK_CATALOG_MODULE)
  const sw = container.resolve(STANDALONE_WIRING_CATALOG_MODULE)
  const productModule = container.resolve(Modules.PRODUCT)

  const cleanup: Array<() => Promise<void>> = []
  const createdProductIds: string[] = []
  let failures = 0
  const check = (label: string, ok: boolean, detail?: string) => {
    if (ok) logger.info(`  ✔ ${label}`)
    else { logger.error(`  ✘ ${label}${detail ? `: ${detail}` : ""}`); failures++ }
  }

  try {
    logger.info("=== Setup: VW Golf 7 + 1 Hook + 1 BikeRack + 1 universal SW ===")
    const [brand] = await fitment.createBrands([{ code: "land-vw", name: "Land VW", display_order: 0 }])
    cleanup.push(async () => { await fitment.deleteBrands([brand.id]) })
    const [model] = await fitment.createVehicleModels([{ code: "land-golf", name: "Land Golf", display_order: 0, brand_id: brand.id }])
    cleanup.push(async () => { await fitment.deleteVehicleModels([model.id]) })
    const [gen] = await fitment.createGenerations([{
      code: "land-golf-7", name: "Land Golf 7", year_from: 2012, year_to: 2019,
      body_type: "Hatchback", vehicle_model_id: model.id,
    }])
    cleanup.push(async () => { await fitment.deleteGenerations([gen.id]) })

    const [hook] = await hooks.createHooks([{
      catalog_number: "LAND/Z/001", name: "Land Hook", manufacturer: "Imioła",
      pulling_capacity_kg: 1800, vertical_load_kg: 95, homologation: "E20",
      ball_type: "Stała", requires_bumper_cutting: false, warranty_years: 2,
      weight_kg: 11, description_html: "<p>land</p>", thumbnail: "",
      gallery: [], short_description: null, manufacturer_catalog_number: null,
      installation_manual_url: null, certificate_url: null,
    }])
    cleanup.push(async () => { await hooks.deleteHooks([hook.id]) })

    const [bikeRack] = await bikeRacks.createBikeRacks([{
      catalog_number: "LAND-BR-01", name: "Land Bagaznik", manufacturer: "Thule",
      max_bikes: 3, max_bike_weight_kg: 25, max_total_load_kg: 60, power_socket: "13-pin",
      weight_kg: 18, length_cm: 110, has_lockable_attachment: true, has_rear_lights: true,
      has_tilt_function: true, tool_free_assembly: true, warranty_years: 2,
      description_html: "<p>land br</p>", short_description: null, thumbnail: "",
      gallery: [], installation_manual_url: null,
    }])
    cleanup.push(async () => { await bikeRacks.deleteBikeRacks([bikeRack.id]) })

    const [universalSw] = await sw.createStandaloneWirings([{
      catalog_number: "LAND-SW-UNI", name: "Land Uniwersalny", manufacturer: "ConWys",
      type: "module", pin_count: 13, weight_kg: 2,
      has_fog_lights: true, has_reverse_lights: true, has_stop_lights: true, has_indicators: true,
      homologation: "E20", warranty_years: 2, fits_all_vehicles: true,
      description_html: "<p>uni</p>", short_description: null, thumbnail: "",
      gallery: [], installation_manual_url: null,
    }])
    cleanup.push(async () => { await sw.deleteStandaloneWirings([universalSw.id]) })

    const { result: hookProducts } = await createProductFromHookWorkflow(container).run({
      input: { hookId: hook.id, generationIds: [gen.id],
        variantPrices: { BARE: 400, W7: 450, W13: 500, M7: 550, M13: 650 }, status: "published" },
    })
    hookProducts.forEach((p) => createdProductIds.push(p.id))

    const { result: brProducts } = await createProductFromBikeRackWorkflow(container).run({
      input: { bikeRackId: bikeRack.id, price: 1500, status: "published" },
    })
    brProducts.forEach((p) => createdProductIds.push(p.id))

    const { result: uniProducts } = await createProductFromStandaloneWiringWorkflow(container).run({
      input: { wiringId: universalSw.id, price: 300, status: "published" },
    })
    uniProducts.forEach((p) => createdProductIds.push(p.id))

    logger.info(`Created products: ${hookProducts.length} hook + ${brProducts.length} bike rack + ${uniProducts.length} universal SW`)

    // ────────────────────────────────────────────────────────────
    logger.info("=== TEST 1: GET /store/categories/hooks/products (filter manufacturer=Imioła) ===")
    const r1 = await apiGet("/store/categories/hooks/products?manufacturer=Imio%C5%82a")
    check("status 200", r1.status === 200, `got ${r1.status}`)
    const r1b = r1.body as { products?: Array<{ handle: string }>; count?: number }
    check("count >= 1", (r1b.count ?? 0) >= 1, `got ${r1b.count}`)

    logger.info("=== TEST 2: hooks filter pulling_capacity_min=2000 (excludes our 1800) ===")
    const r2 = await apiGet("/store/categories/hooks/products?pulling_capacity_min=2000")
    check("status 200", r2.status === 200)
    const r2b = r2.body as { count?: number; products: Array<{ id: string }> }
    check(
      "our product (1800kg) excluded",
      !r2b.products.some((p) => hookProducts.some((hp) => hp.id === p.id)),
    )

    // ────────────────────────────────────────────────────────────
    logger.info("=== TEST 3: GET /store/categories/bike-racks/products (filter has_tilt_function=true) ===")
    const r3 = await apiGet("/store/categories/bike-racks/products?has_tilt_function=true")
    check("status 200", r3.status === 200, `got ${r3.status}`)
    const r3b = r3.body as { count?: number }
    check("count >= 1", (r3b.count ?? 0) >= 1)

    // ────────────────────────────────────────────────────────────
    logger.info("=== TEST 4: GET /store/categories/standalone-wiring/products (filter type=module, pin_count=13) ===")
    const r4 = await apiGet("/store/categories/standalone-wiring/products?type=module&pin_count=13")
    check("status 200", r4.status === 200, `got ${r4.status}`)
    const r4b = r4.body as { count?: number }
    check("count >= 1", (r4b.count ?? 0) >= 1)

    // ────────────────────────────────────────────────────────────
    logger.info("=== TEST 5: GET /store/landing/land-vw ===")
    const r5 = await apiGet("/store/landing/land-vw")
    check("status 200", r5.status === 200, `got ${r5.status}`)
    const r5b = r5.body as { brand?: { code: string }; product_count?: number }
    check("brand.code = land-vw", r5b.brand?.code === "land-vw")
    check("product_count >= 1 (hook product)", (r5b.product_count ?? 0) >= 1)

    logger.info("=== TEST 6: GET /store/landing/land-vw/land-golf ===")
    const r6 = await apiGet("/store/landing/land-vw/land-golf")
    check("status 200", r6.status === 200, `got ${r6.status}`)
    const r6b = r6.body as { model?: { code: string }; product_count?: number }
    check("model.code = land-golf", r6b.model?.code === "land-golf")
    check("product_count >= 1", (r6b.product_count ?? 0) >= 1)

    logger.info("=== TEST 7: GET /store/landing/land-vw/land-golf/land-golf-7 ===")
    const r7 = await apiGet("/store/landing/land-vw/land-golf/land-golf-7")
    check("status 200", r7.status === 200, `got ${r7.status}`)
    const r7b = r7.body as {
      generation?: { years_label: string; full_name: string; url_slug: string }
      products?: { hooks: Array<unknown>; standalone_wiring: Array<unknown>; bike_racks: Array<unknown> }
      totals?: { hooks: number; standalone_wiring: number; bike_racks: number }
    }
    check("years_label = 2012-2019", r7b.generation?.years_label === "2012-2019", `got "${r7b.generation?.years_label}"`)
    check("full_name includes brand+model+gen", Boolean(r7b.generation?.full_name?.includes("Land Golf")))
    check("url_slug = land-vw/land-golf/land-golf-7-2012-2019", r7b.generation?.url_slug === "land-vw/land-golf/land-golf-7-2012-2019")
    check("hooks >= 1", (r7b.totals?.hooks ?? 0) >= 1)
    check("standalone_wiring >= 1 (universal)", (r7b.totals?.standalone_wiring ?? 0) >= 1)
    check("bike_racks >= 1 (always universal)", (r7b.totals?.bike_racks ?? 0) >= 1)

    logger.info("=== TEST 8: 404 for unknown landing ===")
    const r8 = await apiGet("/store/landing/nope/nope/nope")
    check("status 404", r8.status === 404, `got ${r8.status}`)

    if (failures === 0) {
      logger.info("=== ALL TESTS PASSED ===")
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
