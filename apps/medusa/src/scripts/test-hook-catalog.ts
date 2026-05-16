import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HOOK_CATALOG_MODULE } from "../modules/hook-catalog"
import HookCatalogService from "../modules/hook-catalog/service"

export default async function testHookCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const hooks = container.resolve<HookCatalogService>(HOOK_CATALOG_MODULE)

  logger.info("=== test hook_catalog: create Hook ===")

  const [hook] = await hooks.createHooks([{
    catalog_number: "Z/016-TEST",
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
    description_html: "<p>Hak testowy</p>",
    short_description: null,
    thumbnail: "https://example.com/thumb.jpg",
    gallery: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
    installation_manual_url: null,
    certificate_url: null,
  }])
  logger.info(`Hook created: ${hook.id} (catalog_number=${hook.catalog_number})`)

  logger.info("=== verify retrieve + types ===")
  const retrieved = await hooks.retrieveHook(hook.id)
  logger.info(`Pulling capacity: ${retrieved.pulling_capacity_kg} kg (type: ${typeof retrieved.pulling_capacity_kg})`)
  logger.info(`Gallery items: ${(retrieved.gallery as string[]).length}`)
  logger.info(`Requires bumper cutting: ${retrieved.requires_bumper_cutting}`)

  logger.info("=== verify unique constraint on catalog_number ===")
  try {
    await hooks.createHooks([{
      catalog_number: "Z/016-TEST",
      name: "Duplikat",
      manufacturer: "Test",
      pulling_capacity_kg: 1000,
      vertical_load_kg: 50,
      homologation: "E20",
      ball_type: "Stała",
      requires_bumper_cutting: false,
      warranty_years: 2,
      weight_kg: 5,
      description_html: "<p>dup</p>",
      thumbnail: "https://example.com/dup.jpg",
      gallery: [],
    }])
    logger.error("FAIL: duplicate catalog_number was accepted")
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    logger.info(`OK: duplicate rejected — ${msg.split("\n")[0]}`)
  }

  logger.info("=== verify list with filter ===")
  const byManufacturer = await hooks.listHooks({ manufacturer: "Imioła Hak-Pol" })
  logger.info(`Hooks by manufacturer "Imioła Hak-Pol": ${byManufacturer.length}`)

  const byBallType = await hooks.listHooks({ ball_type: "Odkręcana" })
  logger.info(`Hooks with ball_type "Odkręcana": ${byBallType.length}`)

  logger.info("=== cleanup ===")
  await hooks.deleteHooks([hook.id])
  logger.info("Cleanup done. Test PASSED.")
}
