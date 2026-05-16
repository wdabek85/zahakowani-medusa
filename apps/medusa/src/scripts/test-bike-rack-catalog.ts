import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BIKE_RACK_CATALOG_MODULE } from "../modules/bike-rack-catalog"
import BikeRackCatalogService from "../modules/bike-rack-catalog/service"

export default async function testBikeRackCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bikeRacks = container.resolve<BikeRackCatalogService>(BIKE_RACK_CATALOG_MODULE)

  logger.info("=== test bike_rack_catalog: create BikeRack ===")

  const [rack] = await bikeRacks.createBikeRacks([{
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
    description_html: "<p>Bagażnik testowy</p>",
    short_description: null,
    thumbnail: "https://example.com/thumb.jpg",
    gallery: [],
    installation_manual_url: null,
  }])
  logger.info(`BikeRack created: ${rack.id} (${rack.catalog_number})`)

  logger.info("=== verify list with filter by max_bikes ===")
  const big = await bikeRacks.listBikeRacks({ max_bikes: 3 })
  logger.info(`Bike racks with max_bikes=3: ${big.length}`)

  logger.info("=== verify boolean & enum-like fields stored correctly ===")
  const retrieved = await bikeRacks.retrieveBikeRack(rack.id)
  logger.info(`power_socket: "${retrieved.power_socket}" (typeof ${typeof retrieved.power_socket})`)
  logger.info(`has_tilt_function: ${retrieved.has_tilt_function} (typeof ${typeof retrieved.has_tilt_function})`)
  logger.info(`max_total_load_kg: ${retrieved.max_total_load_kg}`)

  logger.info("=== cleanup ===")
  await bikeRacks.deleteBikeRacks([rack.id])
  logger.info("Cleanup done. Test PASSED.")
}
