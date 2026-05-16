import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import { BIKE_RACK_CATALOG_MODULE } from "../modules/bike-rack-catalog"
import { STANDALONE_WIRING_CATALOG_MODULE } from "../modules/standalone-wiring-catalog"
import { createProductFromBikeRackWorkflow } from "../workflows/create-product-from-bike-rack"
import { createProductFromStandaloneWiringWorkflow } from "../workflows/create-product-from-standalone-wiring"
import VehicleFitmentService from "../modules/vehicle-fitment/service"
import BikeRackCatalogService from "../modules/bike-rack-catalog/service"
import StandaloneWiringCatalogService from "../modules/standalone-wiring-catalog/service"

export default async function testWorkflows2({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fitment = container.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  const bikeRacks = container.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)
  const standaloneWiring = container.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)
  const productModule = container.resolve(Modules.PRODUCT)

  const createdProductIds: string[] = []
  const cleanup: Array<() => Promise<void>> = []
  let failures = 0

  try {
    logger.info("=== TEST 1: createProductFromBikeRack ===")

    const [bikeRack] = await bikeRacks.createBikeRacks([{
      catalog_number: "TEST-BR-001",
      name: "Bagaznik testowy",
      manufacturer: "Producent Test",
      max_bikes: 3,
      max_bike_weight_kg: 15,
      max_total_load_kg: 45,
      power_socket: "13-pin",
      weight_kg: 17,
      length_cm: 108,
      has_lockable_attachment: true,
      has_rear_lights: true,
      has_tilt_function: true,
      tool_free_assembly: true,
      warranty_years: 2,
      description_html: "<p>test</p>",
      short_description: null,
      thumbnail: "",
      gallery: [],
      installation_manual_url: null,
    }])
    cleanup.push(async () => { await bikeRacks.deleteBikeRacks([bikeRack.id]) })

    const { result: brProducts } = await createProductFromBikeRackWorkflow(container).run({
      input: { bikeRackId: bikeRack.id, price: 1200, status: "draft" },
    })
    brProducts.forEach((p) => createdProductIds.push(p.id))

    if (brProducts.length !== 1) {
      logger.error(`  ✘ expected 1 product, got ${brProducts.length}`); failures++
    } else {
      logger.info(`  ✔ 1 product created: "${brProducts[0].title}"`)
    }

    const { data: brWithLink } = await query.graph({
      entity: "product",
      fields: ["id", "title", "variants.sku", "bike_rack.id", "bike_rack.catalog_number"],
      filters: { id: brProducts.map((p) => p.id) },
    })
    const brData = brWithLink[0] as { variants: Array<{ sku: string }>; bike_rack?: { catalog_number: string } | Array<{ catalog_number: string }> }
    const br = Array.isArray(brData.bike_rack) ? brData.bike_rack[0] : brData.bike_rack
    if (br?.catalog_number !== "TEST-BR-001") {
      logger.error(`  ✘ Product not linked to BikeRack`); failures++
    } else {
      logger.info(`  ✔ Product → BikeRack(${br.catalog_number})`)
    }
    if (brData.variants.length !== 1 || brData.variants[0].sku !== "TEST-BR-001") {
      logger.error(`  ✘ wrong variant SKU: ${JSON.stringify(brData.variants)}`); failures++
    } else {
      logger.info(`  ✔ single variant with SKU "TEST-BR-001"`)
    }

    logger.info("=== TEST 2: createProductFromStandaloneWiring (universal) ===")

    const [universalWiring] = await standaloneWiring.createStandaloneWirings([{
      catalog_number: "TEST-SW-UNI",
      name: "Modul uniwersalny testowy",
      manufacturer: "Producent Test",
      type: "module",
      pin_count: 13,
      weight_kg: 2,
      has_fog_lights: true,
      has_reverse_lights: true,
      has_stop_lights: true,
      has_indicators: true,
      homologation: "E20",
      warranty_years: 2,
      fits_all_vehicles: true,
      description_html: "<p>test</p>",
      short_description: null,
      thumbnail: "",
      gallery: [],
      installation_manual_url: null,
    }])
    cleanup.push(async () => { await standaloneWiring.deleteStandaloneWirings([universalWiring.id]) })

    const { result: uniProducts } = await createProductFromStandaloneWiringWorkflow(container).run({
      input: { wiringId: universalWiring.id, price: 350, status: "draft" },
    })
    uniProducts.forEach((p) => createdProductIds.push(p.id))

    if (uniProducts.length !== 1) {
      logger.error(`  ✘ expected 1 universal product, got ${uniProducts.length}`); failures++
    } else {
      logger.info(`  ✔ 1 universal product: "${uniProducts[0].title}"`)
    }

    const { data: uniWithLink } = await query.graph({
      entity: "product",
      fields: ["id", "title", "variants.sku", "standalone_wiring.catalog_number", "generations.code"],
      filters: { id: uniProducts.map((p) => p.id) },
    })
    const uniData = uniWithLink[0] as {
      variants: Array<{ sku: string }>
      standalone_wiring?: { catalog_number: string } | Array<{ catalog_number: string }>
      generations?: Array<{ code: string }>
    }
    const sw = Array.isArray(uniData.standalone_wiring) ? uniData.standalone_wiring[0] : uniData.standalone_wiring
    if (sw?.catalog_number !== "TEST-SW-UNI") {
      logger.error(`  ✘ Product not linked to StandaloneWiring`); failures++
    } else {
      logger.info(`  ✔ Product → StandaloneWiring(${sw.catalog_number})`)
    }
    if (uniData.generations && uniData.generations.length > 0) {
      logger.error(`  ✘ universal product should have NO generation links, got ${uniData.generations.length}`); failures++
    } else {
      logger.info(`  ✔ universal product has no Generation links (correct)`)
    }

    logger.info("=== TEST 3: createProductFromStandaloneWiring (per-generation, 2 generations) ===")

    const [brand] = await fitment.createBrands([{ code: "test-vw", name: "Test VW", display_order: 0 }])
    const [model] = await fitment.createVehicleModels([{
      code: "test-passat", name: "Test Passat", display_order: 0, brand_id: brand.id,
    }])
    const [gen1, gen2] = await fitment.createGenerations([
      { code: "test-passat-b8", name: "Test Passat B8", year_from: 2014, year_to: 2023, body_type: "Kombi", vehicle_model_id: model.id },
      { code: "test-passat-b9", name: "Test Passat B9", year_from: 2024, year_to: null, body_type: "Kombi", vehicle_model_id: model.id },
    ])
    cleanup.push(async () => { await fitment.deleteGenerations([gen1.id, gen2.id]) })
    cleanup.push(async () => { await fitment.deleteVehicleModels([model.id]) })
    cleanup.push(async () => { await fitment.deleteBrands([brand.id]) })

    const [perGenWiring] = await standaloneWiring.createStandaloneWirings([{
      catalog_number: "TEST-SW-VW",
      name: "Wiazka VW testowa",
      manufacturer: "Producent Test",
      type: "harness",
      pin_count: 7,
      weight_kg: 2,
      has_fog_lights: false,
      has_reverse_lights: true,
      has_stop_lights: true,
      has_indicators: true,
      homologation: "E11",
      warranty_years: 2,
      fits_all_vehicles: false,
      description_html: "<p>test per-gen</p>",
      short_description: null,
      thumbnail: "",
      gallery: [],
      installation_manual_url: null,
    }])
    cleanup.push(async () => { await standaloneWiring.deleteStandaloneWirings([perGenWiring.id]) })

    const { result: perGenProducts } = await createProductFromStandaloneWiringWorkflow(container).run({
      input: { wiringId: perGenWiring.id, generationIds: [gen1.id, gen2.id], price: 280, status: "draft" },
    })
    perGenProducts.forEach((p) => createdProductIds.push(p.id))

    if (perGenProducts.length !== 2) {
      logger.error(`  ✘ expected 2 products (one per generation), got ${perGenProducts.length}`); failures++
    } else {
      logger.info(`  ✔ 2 products created (one per generation)`)
    }

    const { data: perGenWithLink } = await query.graph({
      entity: "product",
      fields: ["id", "variants.sku", "generations.code", "standalone_wiring.catalog_number"],
      filters: { id: perGenProducts.map((p) => p.id) },
    })
    for (const p of perGenWithLink as Array<{ id: string; variants: Array<{ sku: string }>; generations?: Array<{ code: string }>; standalone_wiring?: { catalog_number: string } | Array<{ catalog_number: string }> }>) {
      const gens = p.generations ?? []
      const sw = Array.isArray(p.standalone_wiring) ? p.standalone_wiring[0] : p.standalone_wiring
      if (gens.length !== 1) {
        logger.error(`  ✘ product should link to 1 generation, got ${gens.length}`); failures++
      } else {
        logger.info(`  ✔ product → Generation(${gens[0].code}), SKU=${p.variants[0].sku}`)
      }
      if (sw?.catalog_number !== "TEST-SW-VW") {
        logger.error(`  ✘ product not linked to StandaloneWiring`); failures++
      }
    }

    logger.info("=== TEST 4: invalid input — fits_all_vehicles=true but generationIds provided ===")
    try {
      await createProductFromStandaloneWiringWorkflow(container).run({
        input: { wiringId: universalWiring.id, generationIds: [gen1.id], price: 100 },
      })
      logger.error(`  ✘ should have thrown for fits_all_vehicles + generationIds`); failures++
    } catch (e) {
      const msg = (e as Error).message
      if (msg.includes("fits_all_vehicles=true")) {
        logger.info(`  ✔ rejected with: ${msg.split("\n")[0]}`)
      } else {
        logger.error(`  ✘ wrong error: ${msg.split("\n")[0]}`); failures++
      }
    }

    if (failures === 0) {
      logger.info("=== ALL TESTS PASSED ===")
    } else {
      logger.error(`=== ${failures} assertion(s) FAILED ===`)
    }
  } finally {
    logger.info("=== Cleanup ===")
    try {
      if (createdProductIds.length) {
        await productModule.deleteProducts(createdProductIds)
        logger.info(`Deleted ${createdProductIds.length} test product(s)`)
      }
    } catch (e) { logger.error(`Cleanup products: ${(e as Error).message}`) }
    for (const fn of cleanup.reverse()) {
      try { await fn() } catch {}
    }
    logger.info("Cleanup done.")
  }
}
