import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import { HOOK_CATALOG_MODULE } from "../modules/hook-catalog"
import { createProductFromHookWorkflow } from "../workflows/create-product-from-hook"
import VehicleFitmentService from "../modules/vehicle-fitment/service"
import HookCatalogService from "../modules/hook-catalog/service"

const TEST_BRAND_CODE = "test-skoda"
const TEST_HOOK_NUMBER = "TEST/Z/016"

export default async function testCreateProductFromHook({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fitment = container.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  const hooks = container.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)

  logger.info("=== Test setup: create Brand → Model → 2 Generations + Hook ===")

  const [brand] = await fitment.createBrands([{
    code: TEST_BRAND_CODE, name: "Test Skoda", display_order: 0,
  }])
  const [vehicleModel] = await fitment.createVehicleModels([{
    code: "test-octavia", name: "Test Octavia", display_order: 0, brand_id: brand.id,
  }])
  const [gen1, gen2] = await fitment.createGenerations([
    {
      code: "test-octavia-3", name: "Test Octavia 3", year_from: 2013, year_to: 2019,
      body_type: "Kombi", vehicle_model_id: vehicleModel.id,
    },
    {
      code: "test-octavia-4", name: "Test Octavia 4", year_from: 2020, year_to: null,
      body_type: "Kombi", vehicle_model_id: vehicleModel.id,
    },
  ])

  const [hook] = await hooks.createHooks([{
    catalog_number: TEST_HOOK_NUMBER, name: "Test Hak", manufacturer: "Test Manuf",
    pulling_capacity_kg: 1800, vertical_load_kg: 98, homologation: "E20",
    ball_type: "Odkręcana", requires_bumper_cutting: false, warranty_years: 2,
    weight_kg: 10, description_html: "<p>test</p>", thumbnail: "",
    gallery: [], short_description: null, manufacturer_catalog_number: null,
    installation_manual_url: null, certificate_url: null,
  }])
  logger.info(`Created Hook ${hook.id} (${hook.catalog_number}), 2 generations`)

  let createdProducts: Array<{ id: string }> = []

  try {
    logger.info("=== Running workflow createProductFromHook (2 generations) ===")
    const { result } = await createProductFromHookWorkflow(container).run({
      input: {
        hookId: hook.id,
        generationIds: [gen1.id, gen2.id],
        variantPrices: { BARE: 420, W7: 480, W13: 530, M7: 580, M13: 700 },
        variantInventory: { BARE: 5, W7: 5, W13: 5, M7: 5, M13: 5 },
        status: "draft",
      },
    })
    createdProducts = result
    logger.info(`Workflow returned ${result.length} product(s)`)

    if (result.length !== 2) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE,
        `Expected 2 products (one per generation), got ${result.length}`)
    }

    logger.info("=== Verify product structure ===")
    const productIds = result.map((p) => p.id)
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "handle", "status",
        "variants.id", "variants.title", "variants.sku", "variants.manage_inventory",
        "options.id", "options.title",
      ],
      filters: { id: productIds },
    })

    let failures = 0
    for (const p of products) {
      logger.info(`Product: "${p.title}"`)
      logger.info(`  handle: ${p.handle}`)
      logger.info(`  variants: ${p.variants.length} | options: ${p.options.length}`)
      if (p.variants.length !== 5) {
        logger.error(`  ✘ expected 5 variants, got ${p.variants.length}`); failures++
      } else {
        logger.info(`  ✔ 5 variants`)
      }
      if (p.options.length !== 1) {
        logger.error(`  ✘ expected 1 option, got ${p.options.length}`); failures++
      }
      const skus = p.variants.map((v: { sku: string }) => v.sku).sort()
      const generationCode = p.title.includes("Octavia 3") ? "test-octavia-3" : "test-octavia-4"
      const expectedSkus = ["BARE", "M13", "M7", "W13", "W7"].map((c) => `${TEST_HOOK_NUMBER}-${generationCode}-${c}`).sort()
      if (JSON.stringify(skus) !== JSON.stringify(expectedSkus)) {
        logger.error(`  ✘ SKU mismatch:\n      expected: ${expectedSkus.join(", ")}\n      got:      ${skus.join(", ")}`); failures++
      } else {
        logger.info(`  ✔ SKUs correct: ${skus.join(", ")}`)
      }
    }

    logger.info("=== Verify Product↔Hook + Product↔Generation links ===")
    const { data: productsWithHook } = await query.graph({
      entity: "product",
      fields: ["id", "hook.id", "hook.catalog_number"],
      filters: { id: productIds },
    })
    for (const p of productsWithHook) {
      if (!p.hook || p.hook.id !== hook.id) {
        logger.error(`  ✘ Product ${p.id} not linked to Hook ${hook.id}`); failures++
      } else {
        logger.info(`  ✔ Product → Hook(${p.hook.catalog_number})`)
      }
    }

    const { data: productsWithGen } = await query.graph({
      entity: "product",
      fields: ["id", "generations.id", "generations.code"],
      filters: { id: productIds },
    })
    for (const p of productsWithGen) {
      const linkedGens = (p as { generations?: Array<{ id: string; code: string }> }).generations ?? []
      if (!linkedGens.length) {
        logger.error(`  ✘ Product ${p.id} not linked to any generation`); failures++
      } else {
        logger.info(`  ✔ Product → Generation(${linkedGens.map((g) => g.code).join(", ")})`)
      }
    }

    logger.info("=== Verify variant.metadata.wiring_equipment_id (Medusa 2.15.2 workaround) ===")
    const variantIds = products.flatMap((p) => p.variants.map((v: { id: string }) => v.id))
    const { data: variantsWithMeta } = await query.graph({
      entity: "product_variant",
      fields: ["id", "sku", "metadata"],
      filters: { id: variantIds },
    })
    let withWiring = 0, withoutWiring = 0
    for (const v of variantsWithMeta as Array<{ id: string; sku: string; metadata: Record<string, unknown> | null }>) {
      const skuTail = v.sku.split("-").pop()
      const wiringId = v.metadata?.wiring_equipment_id as string | undefined
      const wiringCode = v.metadata?.wiring_equipment_code as string | undefined
      if (wiringId) {
        withWiring++
        if (wiringCode !== skuTail) {
          logger.error(`  ✘ variant ${v.sku}: metadata.code "${wiringCode}" ≠ sku tail "${skuTail}"`); failures++
        }
      } else {
        withoutWiring++
        if (skuTail !== "BARE") {
          logger.error(`  ✘ variant ${v.sku}: no metadata.wiring_equipment_id but tail "${skuTail}" ≠ BARE`); failures++
        }
      }
    }
    logger.info(`  variants with metadata.wiring_equipment_id: ${withWiring} (expected 8 = 2 products × 4 non-BARE)`)
    logger.info(`  variants without metadata: ${withoutWiring} (expected 2 = 2 products × BARE)`)
    if (withWiring !== 8 || withoutWiring !== 2) failures++

    if (failures === 0) {
      logger.info("=== TEST PASSED ===")
    } else {
      logger.error(`=== ${failures} assertion(s) FAILED ===`)
    }
  } finally {
    logger.info("=== Cleanup ===")
    try {
      if (createdProducts.length) {
        const productModule = container.resolve(Modules.PRODUCT)
        await productModule.deleteProducts(createdProducts.map((p) => p.id))
        logger.info(`Deleted ${createdProducts.length} test product(s)`)
      }
    } catch (e) {
      logger.error(`Cleanup products failed: ${(e as Error).message}`)
    }
    try { await hooks.deleteHooks([hook.id]) } catch {}
    try { await fitment.deleteGenerations([gen1.id, gen2.id]) } catch {}
    try { await fitment.deleteVehicleModels([vehicleModel.id]) } catch {}
    try { await fitment.deleteBrands([brand.id]) } catch {}
    logger.info("Cleanup done.")
  }
}
