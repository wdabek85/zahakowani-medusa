import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import { HOOK_CATALOG_MODULE } from "../modules/hook-catalog"
import VehicleFitmentService from "../modules/vehicle-fitment/service"
import HookCatalogService from "../modules/hook-catalog/service"
import { createProductFromHookWorkflow } from "../workflows/create-product-from-hook"

/**
 * Demo data seeder for the shop preview.
 *
 * Creates 4 different hooks for 4 different car generations (3 new + 1 existing
 * Octavia 3), then publishes each via createProductFromHookWorkflow with
 * status="published" so they're visible in the storefront (when Phase 3 lands).
 *
 * Idempotent — uses listX({ code/catalog_number }) before each createX.
 *
 * Brands/models/generations seeded:
 *  - VW Golf 7 (2012-2019) Hatchback
 *  - Ford Focus 3 (2011-2018) Kombi
 *  - BMW F30 (2012-2019) Sedan
 *  - Skoda Octavia 3 (z initial seed)
 *
 * Hooks:
 *  - W/200 Westfalia — VW Golf 7   (premium, 5y warranty)
 *  - B/305 Brink     — Ford Focus 3 (mid-range)
 *  - S/410 Steinhof  — BMW F30      (automatic ball, requires bumper cutting)
 *  - A/115 Auto-Hak  — Skoda Octavia 3 (budget-friendly Polish)
 */
export default async function seedDemoHooks({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fitment = container.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  const hooks = container.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)

  // ────────────────────────────────────────────────────────────
  // 1. Brand/Model/Generation tree
  // ────────────────────────────────────────────────────────────

  type BrandSeed = {
    code: string; name: string; display_order: number
    models: Array<{
      code: string; name: string
      generations: Array<{
        code: string; name: string; year_from: number; year_to: number | null; body_type: string
      }>
    }>
  }

  const VEHICLES: BrandSeed[] = [
    {
      code: "vw", name: "Volkswagen", display_order: 1,
      models: [{
        code: "golf", name: "Golf",
        generations: [{ code: "golf-7", name: "Golf 7", year_from: 2012, year_to: 2019, body_type: "Hatchback" }],
      }],
    },
    {
      code: "ford", name: "Ford", display_order: 2,
      models: [{
        code: "focus", name: "Focus",
        generations: [{ code: "focus-3", name: "Focus 3", year_from: 2011, year_to: 2018, body_type: "Kombi" }],
      }],
    },
    {
      code: "bmw", name: "BMW", display_order: 3,
      models: [{
        code: "seria-3", name: "Seria 3",
        generations: [{ code: "f30", name: "F30", year_from: 2012, year_to: 2019, body_type: "Sedan" }],
      }],
    },
  ]

  const genIdByKey = new Map<string, string>()

  for (const b of VEHICLES) {
    let brand = (await fitment.listBrands({ code: b.code }))[0]
    if (!brand) {
      [brand] = await fitment.createBrands([{ code: b.code, name: b.name, display_order: b.display_order }])
      logger.info(`+ Brand ${b.code}`)
    }

    for (const m of b.models) {
      let model = (await fitment.listVehicleModels({ brand_id: brand.id, code: m.code }))[0]
      if (!model) {
        [model] = await fitment.createVehicleModels([{ brand_id: brand.id, code: m.code, name: m.name, display_order: 0 }])
        logger.info(`  + Model ${b.code}/${m.code}`)
      }

      for (const g of m.generations) {
        let gen = (await fitment.listGenerations({ vehicle_model_id: model.id, code: g.code }))[0]
        if (!gen) {
          [gen] = await fitment.createGenerations([{
            vehicle_model_id: model.id, code: g.code, name: g.name,
            year_from: g.year_from, year_to: g.year_to, body_type: g.body_type,
          }])
          logger.info(`    + Generation ${b.code}/${m.code}/${g.code}`)
        }
        genIdByKey.set(`${b.code}/${m.code}/${g.code}`, gen.id)
      }
    }
  }

  // Existing Octavia 3 from initial seed
  const octaviaGen = (await fitment.listGenerations({ code: "octavia-3" }))[0]
  if (octaviaGen) genIdByKey.set("skoda/octavia/octavia-3", octaviaGen.id)

  // ────────────────────────────────────────────────────────────
  // 2. 4 Hooks
  // ────────────────────────────────────────────────────────────

  type HookSeed = {
    catalog_number: string
    name: string
    manufacturer: string
    pulling_capacity_kg: number
    vertical_load_kg: number
    homologation: string
    ball_type: string
    requires_bumper_cutting: boolean
    warranty_years: number
    weight_kg: number
    description_html: string
    thumbnail: string
    targetGenerationKey: string
    variantPrices: { BARE: number; W7: number; W13: number; M7: number; M13: number }
  }

  const HOOKS: HookSeed[] = [
    {
      catalog_number: "W/200",
      name: "Hak Westfalia VW Golf 7",
      manufacturer: "Westfalia",
      pulling_capacity_kg: 1500,
      vertical_load_kg: 75,
      homologation: "E20",
      ball_type: "Odkręcana",
      requires_bumper_cutting: false,
      warranty_years: 5,
      weight_kg: 11,
      description_html: "<p><strong>Hak Westfalia W/200</strong> dedykowany do Volkswagena Golfa 7 (2012-2019). Wysoka jakość niemieckiego producenta, kula odkręcana z certyfikatem E20. Gwarancja 5 lat. Idealny do holowania przyczep kempingowych, lawet oraz przewozu rowerów na bagażniku.</p>",
      thumbnail: "https://placehold.co/600x600/2563eb/ffffff?text=Westfalia+W%2F200",
      targetGenerationKey: "vw/golf/golf-7",
      variantPrices: { BARE: 650, W7: 750, W13: 820, M7: 880, M13: 1050 },
    },
    {
      catalog_number: "B/305",
      name: "Hak Brink Ford Focus 3 Kombi",
      manufacturer: "Brink",
      pulling_capacity_kg: 1600,
      vertical_load_kg: 80,
      homologation: "E20",
      ball_type: "Stała",
      requires_bumper_cutting: false,
      warranty_years: 3,
      weight_kg: 12,
      description_html: "<p><strong>Hak Brink B/305</strong> dla Forda Focusa Mk3 Kombi (2011-2018). Kula stała, solidne wykonanie. Idealne rozwiązanie dla codziennej eksploatacji — bagażnik rowerowy lub mała przyczepa.</p>",
      thumbnail: "https://placehold.co/600x600/059669/ffffff?text=Brink+B%2F305",
      targetGenerationKey: "ford/focus/focus-3",
      variantPrices: { BARE: 550, W7: 650, W13: 720, M7: 780, M13: 950 },
    },
    {
      catalog_number: "S/410",
      name: "Hak Steinhof BMW F30",
      manufacturer: "Steinhof",
      pulling_capacity_kg: 1900,
      vertical_load_kg: 95,
      homologation: "E11",
      ball_type: "Automatyczna",
      requires_bumper_cutting: true,
      warranty_years: 2,
      weight_kg: 14,
      description_html: "<p><strong>Hak Steinhof S/410</strong> z kulą automatyczną dla BMW serii 3 F30 (2012-2019). Premium rozwiązanie — kula chowana elektrycznie, wymaga wycięcia zderzaka (instrukcja w komplecie). Polski producent, certyfikat E11.</p>",
      thumbnail: "https://placehold.co/600x600/dc2626/ffffff?text=Steinhof+S%2F410",
      targetGenerationKey: "bmw/seria-3/f30",
      variantPrices: { BARE: 1280, W7: 1380, W13: 1450, M7: 1520, M13: 1680 },
    },
    {
      catalog_number: "A/115",
      name: "Hak Auto-Hak Skoda Octavia 3",
      manufacturer: "Auto-Hak",
      pulling_capacity_kg: 1700,
      vertical_load_kg: 85,
      homologation: "E20",
      ball_type: "Odkręcana",
      requires_bumper_cutting: false,
      warranty_years: 3,
      weight_kg: 10,
      description_html: "<p><strong>Hak Auto-Hak A/115</strong> dla Skody Octavii 3 Kombi (2013-2019). Polski producent, świetny stosunek jakości do ceny. Kula odkręcana, łatwy montaż.</p>",
      thumbnail: "https://placehold.co/600x600/d97706/ffffff?text=Auto-Hak+A%2F115",
      targetGenerationKey: "skoda/octavia/octavia-3",
      variantPrices: { BARE: 380, W7: 460, W13: 530, M7: 580, M13: 720 },
    },
  ]

  logger.info("=== Creating 4 hooks ===")
  for (const h of HOOKS) {
    let hook = (await hooks.listHooks({ catalog_number: h.catalog_number }))[0]
    if (!hook) {
      [hook] = await hooks.createHooks([{
        catalog_number: h.catalog_number,
        name: h.name,
        manufacturer: h.manufacturer,
        manufacturer_catalog_number: null,
        pulling_capacity_kg: h.pulling_capacity_kg,
        vertical_load_kg: h.vertical_load_kg,
        homologation: h.homologation,
        ball_type: h.ball_type,
        requires_bumper_cutting: h.requires_bumper_cutting,
        warranty_years: h.warranty_years,
        weight_kg: h.weight_kg,
        description_html: h.description_html,
        short_description: null,
        thumbnail: h.thumbnail,
        gallery: [h.thumbnail],
        installation_manual_url: null,
        certificate_url: null,
      }])
      logger.info(`+ Hook ${h.catalog_number} (${h.manufacturer})`)
    } else {
      logger.info(`  Hook ${h.catalog_number} already exists`)
    }
  }

  // ────────────────────────────────────────────────────────────
  // 3. Publish each hook as a product (5 variants, status=published)
  // ────────────────────────────────────────────────────────────

  logger.info("=== Publishing products ===")
  for (const h of HOOKS) {
    const hook = (await hooks.listHooks({ catalog_number: h.catalog_number }))[0]
    if (!hook) {
      logger.error(`  ! Hook ${h.catalog_number} missing, skipping`)
      continue
    }
    const generationId = genIdByKey.get(h.targetGenerationKey)
    if (!generationId) {
      logger.error(`  ! Generation ${h.targetGenerationKey} missing, skipping`)
      continue
    }

    try {
      const { result } = await createProductFromHookWorkflow(container).run({
        input: {
          hookId: hook.id,
          generationIds: [generationId],
          variantPrices: h.variantPrices,
          variantInventory: { BARE: 10, W7: 10, W13: 10, M7: 10, M13: 10 },
          status: "published",
        },
      })
      const product = result[0]
      logger.info(`✓ ${h.catalog_number} → ${product.id} (${product.variants.length} variants)`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("already exists")) {
        logger.info(`  Product for ${h.catalog_number} already exists, skipping`)
      } else {
        logger.error(`  ! ${h.catalog_number} failed: ${msg}`)
      }
    }
  }

  logger.info("=== Done ===")
  logger.info("Otworz http://localhost:9000/app → Products. Powinno byc 4 nowe (lub 5 razem ze starym Z/016) + 4 sample Medusy.")
}
