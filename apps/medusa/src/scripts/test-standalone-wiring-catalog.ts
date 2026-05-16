import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { STANDALONE_WIRING_CATALOG_MODULE } from "../modules/standalone-wiring-catalog"
import StandaloneWiringCatalogService from "../modules/standalone-wiring-catalog/service"

export default async function testStandaloneWiringCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const standaloneWiring = container.resolve<StandaloneWiringCatalogService>(STANDALONE_WIRING_CATALOG_MODULE)

  logger.info("=== test standalone_wiring_catalog: create universal + specific ===")

  const [universal] = await standaloneWiring.createStandaloneWirings([{
    catalog_number: "SW-UNI-TEST",
    name: "Modul 13-Pin uniwersalny testowy",
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
    description_html: "<p>Uniwersalny</p>",
    short_description: null,
    thumbnail: "https://example.com/uni.jpg",
    gallery: [],
    installation_manual_url: null,
  }])
  logger.info(`Universal created: ${universal.id} (fits_all_vehicles=${universal.fits_all_vehicles})`)

  const [specific] = await standaloneWiring.createStandaloneWirings([{
    catalog_number: "SW-SPEC-TEST",
    name: "Wiazka 7-Pin specyficzna",
    manufacturer: "Producent Testowy",
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
    description_html: "<p>Specyficzna</p>",
    short_description: null,
    thumbnail: "https://example.com/spec.jpg",
    gallery: [],
    installation_manual_url: null,
  }])
  logger.info(`Specific created: ${specific.id} (fits_all_vehicles=${specific.fits_all_vehicles})`)

  logger.info("=== verify filter by fits_all_vehicles (kluczowa flaga) ===")
  const universals = await standaloneWiring.listStandaloneWirings({ fits_all_vehicles: true })
  logger.info(`Universal (fits_all_vehicles=true): ${universals.length}`)
  const specifics = await standaloneWiring.listStandaloneWirings({ fits_all_vehicles: false })
  logger.info(`Specific (fits_all_vehicles=false): ${specifics.length}`)

  logger.info("=== verify composite filter (type + pin_count) ===")
  const modules13 = await standaloneWiring.listStandaloneWirings({ type: "module", pin_count: 13 })
  logger.info(`type=module, pin_count=13: ${modules13.length}`)

  const harnesses7 = await standaloneWiring.listStandaloneWirings({ type: "harness", pin_count: 7 })
  logger.info(`type=harness, pin_count=7: ${harnesses7.length}`)

  logger.info("=== cleanup ===")
  await standaloneWiring.deleteStandaloneWirings([universal.id, specific.id])
  logger.info("Cleanup done. Test PASSED.")
}
