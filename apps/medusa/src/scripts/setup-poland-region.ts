import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Backend correction for Phase 3 startup.
 *
 * From `create-medusa-app` Medusa seeded a default "Europe" region with EUR.
 * Phase 1+2 created all product prices in PLN (via createProductFromHookWorkflow
 * and seed-demo-hooks.ts), so storefront fetches return empty prices —
 * Medusa returns prices for region.currency_code, which is EUR with no values.
 *
 * This script:
 *  1. Renames "Europe" region → "Polska", switches currency EUR → PLN
 *  2. Assigns country PL to the region
 *  3. Creates a tax region for PL with VAT 23% default rate
 *
 * Shipping options ("Standard Shipping", "Express Shipping") stay as-is —
 * Phase 4 will replace them with real InPost/DPD/DHL integrations.
 *
 * Idempotent — checks current state before each mutation.
 */
export default async function setupPolandRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const regionModule = container.resolve(Modules.REGION)
  const taxModule = container.resolve(Modules.TAX)
  const storeModule = container.resolve(Modules.STORE)

  // ────────────────────────────────────────────────────────────
  // 1. Region: Europe / EUR → Polska / PLN with country PL
  // ────────────────────────────────────────────────────────────
  const regions = await regionModule.listRegions({}, { take: 10 })
  const region = regions[0]
  if (!region) {
    logger.error("Brak regionu w bazie — Medusa initial seed nieukonczony?")
    return
  }

  if (region.currency_code !== "pln" || region.name !== "Polska") {
    await regionModule.updateRegions(region.id, {
      name: "Polska",
      currency_code: "pln",
      countries: ["pl"],
    })
    logger.info(`+ Region zaktualizowany: "${region.name}" (${region.currency_code}) → "Polska" (PLN), country pl`)
  } else {
    logger.info(`  Region juz ustawiony: "${region.name}" (${region.currency_code})`)
  }

  // ────────────────────────────────────────────────────────────
  // 2. Store default currency — Medusa Store has its own list of supported_currencies
  // ────────────────────────────────────────────────────────────
  const stores = await storeModule.listStores({}, { take: 5 })
  const store = stores[0]
  if (store) {
    const currentSupported = (store.supported_currencies ?? []).map((c) => c.currency_code)
    const hasPln = currentSupported.includes("pln")
    const hasDefaultPln = (store.supported_currencies ?? []).some(
      (c) => c.currency_code === "pln" && c.is_default,
    )

    if (!hasPln || !hasDefaultPln) {
      const newSupported = [
        { currency_code: "pln", is_default: true },
        ...((store.supported_currencies ?? [])
          .filter((c) => c.currency_code !== "pln")
          .map((c) => ({ currency_code: c.currency_code, is_default: false }))),
      ]
      await storeModule.updateStores(store.id, { supported_currencies: newSupported })
      logger.info(`+ Store supported_currencies: dodano PLN jako default`)
    } else {
      logger.info(`  Store ma juz PLN jako default currency`)
    }
  }

  // ────────────────────────────────────────────────────────────
  // 3. Tax region for PL with VAT 23%
  // ────────────────────────────────────────────────────────────
  const existingPlTaxRegions = await taxModule.listTaxRegions({ country_code: "pl" }, { take: 5 })
  if (existingPlTaxRegions.length === 0) {
    const [taxRegion] = await taxModule.createTaxRegions([{
      country_code: "pl",
      default_tax_rate: {
        rate: 23,
        name: "VAT 23%",
        code: "vat-pl-23",
      },
    }])
    logger.info(`+ Tax region PL utworzony: ${taxRegion.id} (VAT 23%)`)
  } else {
    logger.info(`  Tax region PL juz istnieje (${existingPlTaxRegions[0].id})`)
  }

  // ────────────────────────────────────────────────────────────
  // 4. Verify: fetch products via region context and check prices
  // ────────────────────────────────────────────────────────────
  const { data: verification } = await query.graph({
    entity: "product",
    fields: ["id", "title", "variants.id", "variants.sku", "variants.calculated_price.calculated_amount"],
    filters: { handle: "hak-holowniczy-volkswagen-golf-golf-7-2012-2019-1500kg-w-200" },
    context: {
      variants: {
        calculated_price: {
          context: { region_id: region.id, currency_code: "pln" },
        },
      },
    },
  })

  if (verification.length) {
    const p = verification[0] as { variants: Array<{ sku: string; calculated_price?: { calculated_amount?: number } | null }> }
    logger.info(`Weryfikacja - Westfalia W/200 (1 produkt z 4):`)
    for (const v of p.variants) {
      const price = v.calculated_price?.calculated_amount ?? "BRAK"
      logger.info(`  ${v.sku}: ${price}`)
    }
  }

  logger.info("=== Done ===")
  logger.info("Region: Polska / PLN | Country: PL | Tax: VAT 23%")
  logger.info("Front (Faza 3) bedzie fetchowal ceny w PLN przez Medusa SDK.")
}
