import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import { HOOK_CATALOG_MODULE } from "../modules/hook-catalog"
import { BIKE_RACK_CATALOG_MODULE } from "../modules/bike-rack-catalog"
import { STANDALONE_WIRING_CATALOG_MODULE } from "../modules/standalone-wiring-catalog"
import VehicleFitmentService from "../modules/vehicle-fitment/service"
import HookCatalogService from "../modules/hook-catalog/service"
import BikeRackCatalogService from "../modules/bike-rack-catalog/service"
import StandaloneWiringCatalogService from "../modules/standalone-wiring-catalog/service"

/**
 * Seeds idempotently the test data required to run the Phase 1 end-to-end
 * verification script (`src/scripts/test-workflows.ts`). Per brief #1 §15.
 *
 * Creates:
 *  - 1 Brand (Skoda) + 1 VehicleModel (Octavia) + 1 Generation (Octavia 3, 2013-2019)
 *  - 1 Hook (Z/016, Imioła Hak-Pol, 1800 kg)
 *  - 1 BikeRack (BR-TEST-01, 3 rowery)
 *  - 1 StandaloneWiring (SW-TEST-01, universal module 13-pin)
 *
 * (The 4 WiringEquipment records are seeded separately by seed-wiring-equipment.ts.)
 *
 * Admin replaces these with real catalog data via the admin UI in Phase 2.
 */
export default async function seedTestCatalogData({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fitment = container.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)
  const hooks = container.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)
  const bikeRacks = container.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)
  const sw = container.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)

  // 1) Brand
  let brand = (await fitment.listBrands({ code: "skoda" }))[0]
  if (!brand) {
    [brand] = await fitment.createBrands([{
      code: "skoda", name: "Skoda", display_order: 0,
    }])
    logger.info(`[seed-test-catalog] Created Brand "skoda"`)
  }

  // 2) VehicleModel
  let vehicleModel = (await fitment.listVehicleModels({ brand_id: brand.id, code: "octavia" }))[0]
  if (!vehicleModel) {
    [vehicleModel] = await fitment.createVehicleModels([{
      code: "octavia", name: "Octavia", display_order: 0, brand_id: brand.id,
    }])
    logger.info(`[seed-test-catalog] Created VehicleModel "octavia"`)
  }

  // 3) Generation
  let generation = (await fitment.listGenerations({ vehicle_model_id: vehicleModel.id, code: "octavia-3" }))[0]
  if (!generation) {
    [generation] = await fitment.createGenerations([{
      code: "octavia-3", name: "Octavia 3", year_from: 2013, year_to: 2019,
      body_type: "Kombi", vehicle_model_id: vehicleModel.id,
    }])
    logger.info(`[seed-test-catalog] Created Generation "octavia-3"`)
  }

  // 4) Hook
  let hook = (await hooks.listHooks({ catalog_number: "Z/016" }))[0]
  if (!hook) {
    [hook] = await hooks.createHooks([{
      catalog_number: "Z/016",
      name: "Hak Skoda Octavia 3 testowy",
      manufacturer: "Imioła Hak-Pol",
      manufacturer_catalog_number: null,
      pulling_capacity_kg: 1800,
      vertical_load_kg: 98,
      homologation: "E20",
      ball_type: "Odkręcana",
      requires_bumper_cutting: false,
      warranty_years: 2,
      weight_kg: 10,
      description_html: "<p>Hak testowy - dane do uzupełnienia.</p>",
      short_description: null,
      thumbnail: "",
      gallery: [],
      installation_manual_url: null,
      certificate_url: null,
    }])
    logger.info(`[seed-test-catalog] Created Hook "Z/016"`)
  }

  // 5) BikeRack
  let bikeRack = (await bikeRacks.listBikeRacks({ catalog_number: "BR-TEST-01" }))[0]
  if (!bikeRack) {
    [bikeRack] = await bikeRacks.createBikeRacks([{
      catalog_number: "BR-TEST-01",
      name: "Bagażnik testowy",
      manufacturer: "Producent Testowy",
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
      description_html: "<p>Bagażnik testowy - dane do uzupełnienia.</p>",
      short_description: null,
      thumbnail: "",
      gallery: [],
      installation_manual_url: null,
    }])
    logger.info(`[seed-test-catalog] Created BikeRack "BR-TEST-01"`)
  }

  // 6) StandaloneWiring
  let standaloneWiring = (await sw.listStandaloneWirings({ catalog_number: "SW-TEST-01" }))[0]
  if (!standaloneWiring) {
    [standaloneWiring] = await sw.createStandaloneWirings([{
      catalog_number: "SW-TEST-01",
      name: "Moduł 13-Pin uniwersalny testowy",
      manufacturer: "Producent Testowy",
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
      description_html: "<p>Moduł testowy uniwersalny - dane do uzupełnienia.</p>",
      short_description: null,
      thumbnail: "",
      gallery: [],
      installation_manual_url: null,
    }])
    logger.info(`[seed-test-catalog] Created StandaloneWiring "SW-TEST-01"`)
  }

  logger.info(`[seed-test-catalog] Done. Seeded: brand=${brand.id}, model=${vehicleModel.id}, gen=${generation.id}, hook=${hook.id}, bike_rack=${bikeRack.id}, sw=${standaloneWiring.id}`)
}
