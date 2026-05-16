import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import { HOOK_CATALOG_MODULE } from "../modules/hook-catalog"
import { BIKE_RACK_CATALOG_MODULE } from "../modules/bike-rack-catalog"
import { STANDALONE_WIRING_CATALOG_MODULE } from "../modules/standalone-wiring-catalog"
import VehicleFitmentService from "../modules/vehicle-fitment/service"
import HookCatalogService from "../modules/hook-catalog/service"
import BikeRackCatalogService from "../modules/bike-rack-catalog/service"
import StandaloneWiringCatalogService from "../modules/standalone-wiring-catalog/service"

const BASE = "http://localhost:9000"
const ADMIN_EMAIL = "admin@zahakowani.pl"
const ADMIN_PASSWORD = "admin123"

async function adminLogin(): Promise<string> {
  const r = await fetch(`${BASE}/auth/user/emailpass`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!r.ok) {
    throw new Error(`Login failed: ${r.status} ${await r.text()}`)
  }
  const body = await r.json() as { token: string }
  return body.token
}

async function adminPost(token: string, path: string, payload: unknown): Promise<{ status: number; body: unknown }> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  return { status: r.status, body: await r.json() }
}

export default async function testPublishEndpoints({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fitment = container.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  const hooks = container.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)
  const bikeRacks = container.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)
  const sw = container.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)
  const productModule = container.resolve(Modules.PRODUCT)

  const createdProductIds: string[] = []
  let failures = 0
  const check = (label: string, ok: boolean, detail?: string) => {
    if (ok) logger.info(`  ✔ ${label}`)
    else { logger.error(`  ✘ ${label}${detail ? `: ${detail}` : ""}`); failures++ }
  }

  logger.info("=== Login as admin ===")
  const token = await adminLogin()
  logger.info(`Token obtained (${token.substring(0, 20)}...)`)

  logger.info("=== Resolve seed data ===")
  const [hook] = await hooks.listHooks({ catalog_number: "Z/016" })
  const [generation] = await fitment.listGenerations({ code: "octavia-3" })
  const [bikeRack] = await bikeRacks.listBikeRacks({ catalog_number: "BR-TEST-01" })
  const [standaloneWiring] = await sw.listStandaloneWirings({ catalog_number: "SW-TEST-01" })

  if (!hook || !generation || !bikeRack || !standaloneWiring) {
    throw new Error("Seed data missing — run `npx medusa db:migrate` first")
  }

  // ────────────────────────────────────────────────────────────
  logger.info("=== TEST 1: POST /admin/catalog/publish-hook (happy path) ===")
  const r1 = await adminPost(token, "/admin/catalog/publish-hook", {
    hookId: hook.id,
    generationIds: [generation.id],
    variantPrices: { BARE: 420, W7: 480, W13: 530, M7: 580, M13: 700 },
    variantInventory: { BARE: 5, W7: 5, W13: 5, M7: 5, M13: 5 },
    status: "draft",
  })
  check("status 200", r1.status === 200, `got ${r1.status}, body: ${JSON.stringify(r1.body)}`)
  const r1b = r1.body as { success?: boolean; productsCreated?: number; productIds?: string[] }
  check("success: true", r1b.success === true)
  check("productsCreated === 1", r1b.productsCreated === 1)
  check("productIds.length === 1", (r1b.productIds?.length ?? 0) === 1)
  if (r1b.productIds) createdProductIds.push(...r1b.productIds)

  // ────────────────────────────────────────────────────────────
  logger.info("=== TEST 2: POST /admin/catalog/publish-bike-rack (happy path) ===")
  const r2 = await adminPost(token, "/admin/catalog/publish-bike-rack", {
    bikeRackId: bikeRack.id,
    price: 1200,
    inventory: 3,
    status: "draft",
  })
  check("status 200", r2.status === 200, `got ${r2.status}, body: ${JSON.stringify(r2.body)}`)
  const r2b = r2.body as { success?: boolean; productsCreated?: number; productIds?: string[] }
  check("success: true", r2b.success === true)
  check("productsCreated === 1", r2b.productsCreated === 1)
  if (r2b.productIds) createdProductIds.push(...r2b.productIds)

  // ────────────────────────────────────────────────────────────
  logger.info("=== TEST 3: POST /admin/catalog/publish-standalone-wiring (universal) ===")
  const r3 = await adminPost(token, "/admin/catalog/publish-standalone-wiring", {
    wiringId: standaloneWiring.id,
    price: 350,
    inventory: 10,
    status: "draft",
  })
  check("status 200", r3.status === 200, `got ${r3.status}, body: ${JSON.stringify(r3.body)}`)
  const r3b = r3.body as { success?: boolean; productsCreated?: number; productIds?: string[] }
  check("success: true", r3b.success === true)
  check("productsCreated === 1 (universal)", r3b.productsCreated === 1)
  if (r3b.productIds) createdProductIds.push(...r3b.productIds)

  // ────────────────────────────────────────────────────────────
  logger.info("=== TEST 4: Validation error — missing hookId ===")
  const r4 = await adminPost(token, "/admin/catalog/publish-hook", {
    generationIds: [generation.id],
    variantPrices: { BARE: 420, W7: 480, W13: 530, M7: 580, M13: 700 },
  })
  check("status 400", r4.status === 400, `got ${r4.status}`)
  const r4b = r4.body as { success?: boolean; error?: string }
  check("success: false", r4b.success === false)
  check("error mentions Validation", r4b.error?.includes("Validation") ?? false, `error: ${r4b.error}`)

  // ────────────────────────────────────────────────────────────
  logger.info("=== TEST 5: Validation error — negative price ===")
  const r5 = await adminPost(token, "/admin/catalog/publish-bike-rack", {
    bikeRackId: bikeRack.id,
    price: -100,
  })
  check("status 400", r5.status === 400, `got ${r5.status}`)
  const r5b = r5.body as { success?: boolean }
  check("success: false", r5b.success === false)

  // ────────────────────────────────────────────────────────────
  logger.info("=== TEST 6: NOT_FOUND — fake hookId ===")
  const r6 = await adminPost(token, "/admin/catalog/publish-hook", {
    hookId: "hook_does_not_exist",
    generationIds: [generation.id],
    variantPrices: { BARE: 420, W7: 480, W13: 530, M7: 580, M13: 700 },
  })
  check("status 404", r6.status === 404, `got ${r6.status}`)
  const r6b = r6.body as { success?: boolean; error?: string }
  check("error mentions not found", (r6b.error?.toLowerCase().includes("not found") ?? false), `error: ${r6b.error}`)

  // ────────────────────────────────────────────────────────────
  logger.info("=== TEST 7: INVALID_DATA — SW universal with generationIds ===")
  const r7 = await adminPost(token, "/admin/catalog/publish-standalone-wiring", {
    wiringId: standaloneWiring.id, // fits_all_vehicles=true
    generationIds: [generation.id],
    price: 100,
  })
  check("status 400", r7.status === 400, `got ${r7.status}`)
  const r7b = r7.body as { success?: boolean; error?: string }
  check("error mentions fits_all_vehicles", (r7b.error?.includes("fits_all_vehicles") ?? false), `error: ${r7b.error}`)

  // ────────────────────────────────────────────────────────────
  logger.info("=== TEST 8: Auth — request without token returns 401 ===")
  const r8 = await fetch(`${BASE}/admin/catalog/publish-hook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hookId: hook.id }),
  })
  check("status 401", r8.status === 401, `got ${r8.status}`)

  // ────────────────────────────────────────────────────────────
  if (failures === 0) {
    logger.info("=== ALL TESTS PASSED ===")
  } else {
    logger.error(`=== ${failures} failure(s) ===`)
  }

  logger.info("=== Cleanup ===")
  if (createdProductIds.length) {
    try {
      await productModule.deleteProducts(createdProductIds)
      logger.info(`Deleted ${createdProductIds.length} test product(s)`)
    } catch (e) {
      logger.error(`Cleanup products: ${(e as Error).message}`)
    }
  }
  logger.info("Cleanup done.")
}
