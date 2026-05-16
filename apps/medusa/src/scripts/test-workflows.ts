import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import { HOOK_CATALOG_MODULE } from "../modules/hook-catalog"
import { BIKE_RACK_CATALOG_MODULE } from "../modules/bike-rack-catalog"
import { STANDALONE_WIRING_CATALOG_MODULE } from "../modules/standalone-wiring-catalog"
import { createProductFromHookWorkflow } from "../workflows/create-product-from-hook"
import { createProductFromBikeRackWorkflow } from "../workflows/create-product-from-bike-rack"
import { createProductFromStandaloneWiringWorkflow } from "../workflows/create-product-from-standalone-wiring"
import VehicleFitmentService from "../modules/vehicle-fitment/service"
import HookCatalogService from "../modules/hook-catalog/service"
import BikeRackCatalogService from "../modules/bike-rack-catalog/service"
import StandaloneWiringCatalogService from "../modules/standalone-wiring-catalog/service"

/**
 * Phase 1 end-to-end verification script (brief #1 §16).
 *
 * Runs all 3 workflows against the seeded test data
 * (see migration-scripts/seed-test-catalog-data.ts):
 *  1. createProductFromHook  → 1 Product (5 variants) for Skoda Octavia 3
 *  2. createProductFromBikeRack → 1 Product (1 variant) for BR-TEST-01
 *  3. createProductFromStandaloneWiring → 1 universal Product for SW-TEST-01
 *
 * After running, head to http://localhost:9000/app → Products and confirm
 * 3 new draft products exist with the expected variants, SKUs and prices.
 */
export default async function testWorkflows({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fitment = container.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  const hooks = container.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)
  const bikeRacks = container.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)
  const sw = container.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)

  logger.info("=== Resolve seeded test data ===")
  const [hook] = await hooks.listHooks({ catalog_number: "Z/016" })
  const [generation] = await fitment.listGenerations({ code: "octavia-3" })
  const [bikeRack] = await bikeRacks.listBikeRacks({ catalog_number: "BR-TEST-01" })
  const [standaloneWiring] = await sw.listStandaloneWirings({ catalog_number: "SW-TEST-01" })

  if (!hook || !generation || !bikeRack || !standaloneWiring) {
    logger.error("Missing seed data — did you run `npx medusa db:migrate`? Aborting.")
    throw new Error("Missing seed data")
  }
  logger.info(`Hook Z/016: ${hook.id}`)
  logger.info(`Generation octavia-3: ${generation.id}`)
  logger.info(`BikeRack BR-TEST-01: ${bikeRack.id}`)
  logger.info(`StandaloneWiring SW-TEST-01: ${standaloneWiring.id}`)

  // ────────────────────────────────────────────────────────────
  logger.info("=== 1/3: createProductFromHook (Skoda Octavia 3) ===")
  const { result: hookResult } = await createProductFromHookWorkflow(container).run({
    input: {
      hookId: hook.id,
      generationIds: [generation.id],
      variantPrices: { BARE: 420, W7: 480, W13: 530, M7: 580, M13: 700 },
      variantInventory: { BARE: 5, W7: 5, W13: 5, M7: 5, M13: 5 },
      status: "draft",
    },
  })
  const hookProduct = hookResult[0]
  logger.info(`  → Product ${hookProduct.id}`)
  logger.info(`     title: ${hookProduct.title}`)
  logger.info(`     handle: ${hookProduct.handle}`)
  logger.info(`     variants: ${hookProduct.variants.length}`)
  for (const v of hookProduct.variants) {
    const meta = v.metadata as Record<string, unknown> | null | undefined
    const wiringCode = meta?.wiring_equipment_code as string | undefined
    logger.info(`        • ${v.sku} → wiring: ${wiringCode ?? "—"} (BARE)`)
  }

  // ────────────────────────────────────────────────────────────
  logger.info("=== 2/3: createProductFromBikeRack (BR-TEST-01) ===")
  const { result: brResult } = await createProductFromBikeRackWorkflow(container).run({
    input: { bikeRackId: bikeRack.id, price: 1200, status: "draft" },
  })
  const brProduct = brResult[0]
  logger.info(`  → Product ${brProduct.id}`)
  logger.info(`     title: ${brProduct.title}`)
  logger.info(`     handle: ${brProduct.handle}`)
  logger.info(`     variants: ${brProduct.variants.length} | SKU: ${brProduct.variants[0]?.sku}`)

  // ────────────────────────────────────────────────────────────
  logger.info("=== 3/3: createProductFromStandaloneWiring (SW-TEST-01, universal) ===")
  const { result: swResult } = await createProductFromStandaloneWiringWorkflow(container).run({
    input: { wiringId: standaloneWiring.id, price: 350, status: "draft" },
  })
  const swProduct = swResult[0]
  logger.info(`  → Product ${swProduct.id}`)
  logger.info(`     title: ${swProduct.title}`)
  logger.info(`     handle: ${swProduct.handle}`)
  logger.info(`     variants: ${swProduct.variants.length} | SKU: ${swProduct.variants[0]?.sku}`)

  logger.info("=== Summary ===")
  logger.info(`Created 3 products. Go to http://localhost:9000/app → Products to verify.`)
  logger.info(`  • Hook product:    ${hookProduct.title} (5 variants)`)
  logger.info(`  • BikeRack product: ${brProduct.title} (1 variant)`)
  logger.info(`  • SW product:      ${swProduct.title} (1 variant, universal — no fitment)`)
}
