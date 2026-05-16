import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  generateProductTitle,
  generateHookVariantTitle,
  generateSku,
  generateProductHandle,
  getYearsLabel,
  GenerationInput,
} from "../utils/catalog"

export default async function testCatalogUtils({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let failures = 0

  const expect = (label: string, actual: string, expected: string) => {
    if (actual === expected) {
      logger.info(`  ✔ ${label}`)
    } else {
      failures++
      logger.error(`  ✘ ${label}\n      expected: "${expected}"\n      actual:   "${actual}"`)
    }
  }

  const generationOctavia: GenerationInput = {
    name: "Octavia 3",
    code: "octavia-3",
    year_from: 2013,
    year_to: 2019,
    vehicle_model: {
      name: "Octavia",
      code: "octavia",
      brand: { name: "Skoda", code: "skoda" },
    },
  }

  const generationCurrent: GenerationInput = {
    ...generationOctavia,
    year_to: null,
  }

  logger.info("=== getYearsLabel ===")
  expect("closed range", getYearsLabel(2013, 2019), "2013-2019")
  expect("open range", getYearsLabel(2020, null), "2020-obecnie")

  logger.info("=== generateProductTitle: hook ===")
  expect(
    "hook product title",
    generateProductTitle({
      category: "hook",
      catalog: { catalog_number: "Z/016", pulling_capacity_kg: 1800 },
      generation: generationOctavia,
    }),
    "Hak holowniczy Skoda Octavia Octavia 3 2013-2019 1800kg Z/016",
  )
  expect(
    "hook title with open range",
    generateProductTitle({
      category: "hook",
      catalog: { catalog_number: "Z/099", pulling_capacity_kg: 2000 },
      generation: generationCurrent,
    }),
    "Hak holowniczy Skoda Octavia Octavia 3 2013-obecnie 2000kg Z/099",
  )

  logger.info("=== generateProductTitle: bike_rack ===")
  expect(
    "bike_rack title",
    generateProductTitle({
      category: "bike_rack",
      catalog: {
        catalog_number: "BR-001",
        name: "EasyFold XT 3",
        manufacturer: "Thule",
        max_bikes: 3,
      },
    }),
    "Thule EasyFold XT 3 - bagażnik rowerowy na hak 3 rowery BR-001",
  )

  logger.info("=== generateProductTitle: standalone_wiring ===")
  expect(
    "universal module 13-pin",
    generateProductTitle({
      category: "standalone_wiring",
      catalog: {
        catalog_number: "MOD-13-UNI",
        name: "uniwersalny",
        manufacturer: "ConWys",
        type: "module",
        pin_count: 13,
        fits_all_vehicles: true,
      },
    }),
    "ConWys uniwersalny Moduł 13-Pin uniwersalny MOD-13-UNI",
  )
  expect(
    "per-generation harness 7-pin",
    generateProductTitle({
      category: "standalone_wiring",
      catalog: {
        catalog_number: "W-7-SK",
        name: "dedykowana",
        manufacturer: "ConWys",
        type: "harness",
        pin_count: 7,
        fits_all_vehicles: false,
      },
      generation: generationOctavia,
    }),
    "ConWys dedykowana Wiązka 7-Pin Skoda Octavia 2013-2019 W-7-SK",
  )

  logger.info("=== generateHookVariantTitle (5 variants) ===")
  const hookCatalog = { catalog_number: "Z/016", pulling_capacity_kg: 1800 }
  expect(
    "BARE variant",
    generateHookVariantTitle({ catalog: hookCatalog, generation: generationOctavia, variantCode: "BARE" }),
    "Hak holowniczy Skoda Octavia Octavia 3 2013-2019 1800kg Z/016",
  )
  expect(
    "W7 variant",
    generateHookVariantTitle({ catalog: hookCatalog, generation: generationOctavia, variantCode: "W7" }),
    "Hak holowniczy + Wiązka 7-Pin Skoda Octavia Octavia 3 2013-2019 1800kg Z/016",
  )
  expect(
    "W13 variant",
    generateHookVariantTitle({ catalog: hookCatalog, generation: generationOctavia, variantCode: "W13" }),
    "Hak holowniczy + Wiązka 13-Pin Skoda Octavia Octavia 3 2013-2019 1800kg Z/016",
  )
  expect(
    "M7 variant",
    generateHookVariantTitle({ catalog: hookCatalog, generation: generationOctavia, variantCode: "M7" }),
    "Hak holowniczy + Moduł 7-Pin Skoda Octavia Octavia 3 2013-2019 1800kg Z/016",
  )
  expect(
    "M13 variant",
    generateHookVariantTitle({ catalog: hookCatalog, generation: generationOctavia, variantCode: "M13" }),
    "Hak holowniczy + Moduł 13-Pin Skoda Octavia Octavia 3 2013-2019 1800kg Z/016",
  )

  logger.info("=== generateSku ===")
  expect("hook BARE sku", generateSku({ category: "hook", catalogNumber: "Z/016", variantCode: "BARE" }), "Z/016-BARE")
  expect("hook M13 sku", generateSku({ category: "hook", catalogNumber: "Z/016", variantCode: "M13" }), "Z/016-M13")
  expect("bike_rack sku", generateSku({ category: "bike_rack", catalogNumber: "BR-2024-01" }), "BR-2024-01")
  expect("standalone sku", generateSku({ category: "standalone_wiring", catalogNumber: "MOD-13-UNI-01" }), "MOD-13-UNI-01")

  logger.info("=== generateProductHandle ===")
  expect(
    "hook handle",
    generateProductHandle("Hak holowniczy Skoda Octavia Octavia 3 2013-2019 1800kg Z/016"),
    "hak-holowniczy-skoda-octavia-octavia-3-2013-2019-1800kg-z-016",
  )
  expect(
    "polskie znaki + symbole",
    generateProductHandle("Hak holowniczy + Wiązka 13-Pin Skoda Octavia 2013-2019"),
    "hak-holowniczy-wiazka-13-pin-skoda-octavia-2013-2019",
  )
  expect(
    "moduł universal",
    generateProductHandle("ConWys uniwersalny Moduł 13-Pin uniwersalny MOD-13-UNI"),
    "conwys-uniwersalny-modul-13-pin-uniwersalny-mod-13-uni",
  )

  logger.info("=== standalone_wiring per-gen without generation should throw ===")
  try {
    generateProductTitle({
      category: "standalone_wiring",
      catalog: {
        catalog_number: "X",
        name: "x",
        manufacturer: "x",
        type: "module",
        pin_count: 13,
        fits_all_vehicles: false,
      },
    })
    failures++
    logger.error("  ✘ should have thrown")
  } catch (e) {
    logger.info(`  ✔ threw: ${(e as Error).message.split(":")[0]}`)
  }

  if (failures === 0) {
    logger.info("=== All tests PASSED ===")
  } else {
    logger.error(`=== ${failures} test(s) FAILED ===`)
    process.exit(1)
  }
}
