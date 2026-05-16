import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"
import ProductModule from "@medusajs/medusa/product"
import { HOOK_CATALOG_MODULE } from "../modules/hook-catalog"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import { WIRING_EQUIPMENT_MODULE } from "../modules/wiring-equipment"
import {
  generateHookVariantTitle,
  generateProductHandle,
  generateProductTitle,
  generateSku,
  HookVariantCode,
} from "../utils/catalog"

const VARIANT_CODES: HookVariantCode[] = ["BARE", "W7", "W13", "M7", "M13"]
const VARIANT_OPTION_TITLE = "Konfiguracja"
const VARIANT_OPTION_LABELS: Record<HookVariantCode, string> = {
  BARE: "Sam hak",
  W7: "+ Wiązka 7-Pin",
  W13: "+ Wiązka 13-Pin",
  M7: "+ Moduł 7-Pin",
  M13: "+ Moduł 13-Pin",
}

export type CreateProductFromHookInput = {
  hookId: string
  generationIds: string[]
  variantPrices: Record<HookVariantCode, number>
  variantInventory?: Partial<Record<HookVariantCode, number>>
  status?: "draft" | "published"
  currencyCode?: string
}

type LoadedContext = {
  hook: {
    id: string
    catalog_number: string
    name: string
    manufacturer: string
    pulling_capacity_kg: number
    weight_kg: number
    description_html: string
    short_description: string | null
    thumbnail: string
    gallery: string[]
  }
  generations: Array<{
    id: string
    name: string
    code: string
    year_from: number
    year_to: number | null
    vehicle_model: {
      id: string
      name: string
      code: string
      brand: {
        id: string
        name: string
        code: string
      }
    }
  }>
  wiringEquipments: Record<Exclude<HookVariantCode, "BARE">, { id: string; weight_kg: number }>
  defaultSalesChannelId: string
  defaultStockLocationId: string
  defaultShippingProfileId: string
}

const loadHookContextStep = createStep(
  "load-hook-context",
  async (
    input: { hookId: string; generationIds: string[] },
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const [
      { data: hookRows },
      { data: generationRows },
      { data: wiringRows },
      { data: salesChannelRows },
      { data: stockLocationRows },
      { data: shippingProfileRows },
    ] = await Promise.all([
      query.graph({
        entity: "hook",
        fields: [
          "id",
          "catalog_number",
          "name",
          "manufacturer",
          "pulling_capacity_kg",
          "weight_kg",
          "description_html",
          "short_description",
          "thumbnail",
          "gallery",
        ],
        filters: { id: input.hookId },
      }),
      query.graph({
        entity: "generation",
        fields: [
          "id",
          "name",
          "code",
          "year_from",
          "year_to",
          "vehicle_model.id",
          "vehicle_model.name",
          "vehicle_model.code",
          "vehicle_model.brand.id",
          "vehicle_model.brand.name",
          "vehicle_model.brand.code",
        ],
        filters: { id: input.generationIds },
      }),
      query.graph({
        entity: "wiring_equipment",
        fields: ["id", "code", "weight_kg"],
      }),
      query.graph({
        entity: "sales_channel",
        fields: ["id"],
      }),
      query.graph({
        entity: "stock_location",
        fields: ["id"],
      }),
      query.graph({
        entity: "shipping_profile",
        fields: ["id"],
      }),
    ])

    if (!hookRows.length) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Hook with id "${input.hookId}" not found`)
    }
    if (generationRows.length !== input.generationIds.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Expected ${input.generationIds.length} generations, found ${generationRows.length}`,
      )
    }
    if (!salesChannelRows.length) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `No sales channel configured`)
    }
    if (!stockLocationRows.length) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `No stock location configured`)
    }
    if (!shippingProfileRows.length) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `No shipping profile configured`)
    }

    const wiringByCode = Object.fromEntries(
      wiringRows.map((w) => [w.code, { id: w.id, weight_kg: w.weight_kg }]),
    ) as LoadedContext["wiringEquipments"]

    for (const required of ["W7", "W13", "M7", "M13"] as const) {
      if (!wiringByCode[required]) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `WiringEquipment "${required}" not seeded — run db:migrate to seed it`,
        )
      }
    }

    const context: LoadedContext = {
      hook: hookRows[0] as LoadedContext["hook"],
      generations: generationRows as LoadedContext["generations"],
      wiringEquipments: wiringByCode,
      defaultSalesChannelId: salesChannelRows[0].id,
      defaultStockLocationId: stockLocationRows[0].id,
      defaultShippingProfileId: shippingProfileRows[0].id,
    }

    return new StepResponse(context)
  },
)

type ProductLinkInput = {
  productId: string
  generationId: string
  hookId: string
  variantLinks: Array<{ variantId: string; wiringEquipmentId: string }>
}

const buildLinkInputsStep = createStep(
  "build-link-inputs",
  async (
    input: {
      createdProducts: Array<{ id: string }>
      generations: LoadedContext["generations"]
      hookId: string
      wiringEquipments: LoadedContext["wiringEquipments"]
    },
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const productIds = input.createdProducts.map((p) => p.id)
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "sku", "product_id"],
      filters: { product_id: productIds },
    })

    // Group variants by product
    const variantsByProduct = new Map<string, typeof variants>()
    for (const v of variants) {
      const list = variantsByProduct.get(v.product_id!) ?? []
      list.push(v)
      variantsByProduct.set(v.product_id!, list)
    }

    const linkInputs: ProductLinkInput[] = input.createdProducts.map((product, idx) => {
      const generation = input.generations[idx]
      const productVariants = variantsByProduct.get(product.id) ?? []

      const variantLinks = productVariants
        .map((v) => {
          // SKU format: "{catalog}-{generation_code}-{variant_code}"
          const variantCode = v.sku.split("-").pop()
          if (!variantCode || variantCode === "BARE") return null
          if (!VARIANT_CODES.includes(variantCode as HookVariantCode)) return null
          if (variantCode === "BARE") return null

          const wiring = input.wiringEquipments[variantCode as Exclude<HookVariantCode, "BARE">]
          if (!wiring) return null
          return { variantId: v.id, wiringEquipmentId: wiring.id }
        })
        .filter((x): x is { variantId: string; wiringEquipmentId: string } => x !== null)

      return {
        productId: product.id,
        generationId: generation.id,
        hookId: input.hookId,
        variantLinks,
      }
    })

    return new StepResponse(linkInputs)
  },
)

const createProductLinksStep = createStep(
  "create-product-links",
  async (links: ProductLinkInput[], { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    // Product-level links (Product↔Hook, Product↔Generation).
    const productLevelRecords = links.flatMap((l) => [
      {
        [Modules.PRODUCT]: { product_id: l.productId },
        [HOOK_CATALOG_MODULE]: { hook_id: l.hookId },
      },
      {
        [Modules.PRODUCT]: { product_id: l.productId },
        [VEHICLE_FITMENT_MODULE]: { generation_id: l.generationId },
      },
    ])
    await link.create(productLevelRecords)

    // KNOWN ISSUE (Medusa 2.15.2): ProductVariant↔WiringEquipment link.create
    // rejects with "Cannot create multiple links between 'product' and
    // 'wiring_equipment'" — Medusa's link resolver does not disambiguate
    // Product vs ProductVariant when both sit under the same `product` service.
    //
    // Workaround for Phase 1: store the wiring_equipment_id on variant.metadata
    // (set in the workflow's product-input transform). The data is queryable
    // via Medusa core's variant.metadata.wiring_equipment_id; the actual link
    // service hookup will be revisited when the underlying Medusa quirk is
    // pinned down or a v2.16+ upgrade lands.
    return new StepResponse(productLevelRecords, productLevelRecords)
  },
  async (linkRecords, { container }) => {
    if (!linkRecords) return
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.dismiss(linkRecords)
  },
)

/**
 * Creates one Product (with 5 variants: BARE/W7/W13/M7/M13) per requested
 * vehicle generation, all derived from a single Hook catalog entry.
 *
 * Per brief #1 §9.1. Compensation is delegated to `createProductsWorkflow`
 * (core flow with built-in rollback) and our explicit `createProductLinksStep`
 * which dismisses links if a later step fails.
 */
export const createProductFromHookWorkflow = createWorkflow(
  "create-product-from-hook",
  (input: CreateProductFromHookInput) => {
    const context = loadHookContextStep({
      hookId: input.hookId,
      generationIds: input.generationIds,
    })

    const productInputs = transform({ context, input }, ({ context, input }) => {
      const currencyCode = input.currencyCode ?? "pln"
      const status = (input.status ?? "draft") as ProductStatus

      return context.generations.map((generation) => {
        const title = generateProductTitle({
          category: "hook",
          catalog: {
            catalog_number: context.hook.catalog_number,
            pulling_capacity_kg: context.hook.pulling_capacity_kg,
          },
          generation: {
            name: generation.name,
            code: generation.code,
            year_from: generation.year_from,
            year_to: generation.year_to,
            vehicle_model: {
              name: generation.vehicle_model.name,
              code: generation.vehicle_model.code,
              brand: {
                name: generation.vehicle_model.brand.name,
                code: generation.vehicle_model.brand.code,
              },
            },
          },
        })

        const variants = VARIANT_CODES.map((code) => {
          const wiring = code === "BARE" ? null : context.wiringEquipments[code]
          const variantTitle = generateHookVariantTitle({
            catalog: {
              catalog_number: context.hook.catalog_number,
              pulling_capacity_kg: context.hook.pulling_capacity_kg,
            },
            generation: {
              name: generation.name,
              code: generation.code,
              year_from: generation.year_from,
              year_to: generation.year_to,
              vehicle_model: {
                name: generation.vehicle_model.name,
                code: generation.vehicle_model.code,
                brand: {
                  name: generation.vehicle_model.brand.name,
                  code: generation.vehicle_model.brand.code,
                },
              },
            },
            variantCode: code,
          })

          return {
            title: variantTitle,
            sku: generateSku({
              category: "hook",
              catalogNumber: context.hook.catalog_number,
              variantCode: code,
              generationCode: generation.code,
            }),
            options: {
              [VARIANT_OPTION_TITLE]: VARIANT_OPTION_LABELS[code],
            },
            weight: context.hook.weight_kg + (wiring?.weight_kg ?? 0),
            manage_inventory: true,
            metadata: wiring
              ? {
                  // See create-product-links.step.ts: storing on metadata
                  // because Medusa 2.15.2 rejects variant↔wiring_equipment
                  // link.create with a service-pair ambiguity.
                  wiring_equipment_id: wiring.id,
                  wiring_equipment_code: code,
                }
              : undefined,
            prices: [
              {
                amount: input.variantPrices[code],
                currency_code: currencyCode,
              },
            ],
          }
        })

        return {
          title,
          handle: generateProductHandle(title),
          description: context.hook.description_html,
          thumbnail: context.hook.thumbnail || undefined,
          status,
          weight: context.hook.weight_kg,
          shipping_profile_id: context.defaultShippingProfileId,
          options: [
            {
              title: VARIANT_OPTION_TITLE,
              values: VARIANT_CODES.map((c) => VARIANT_OPTION_LABELS[c]),
            },
          ],
          variants,
          sales_channels: [{ id: context.defaultSalesChannelId }],
        }
      })
    })

    const createdProducts = createProductsWorkflow.runAsStep({
      input: { products: productInputs },
    })

    const linkInputs = buildLinkInputsStep({
      createdProducts,
      generations: transform({ context }, ({ context }) => context.generations),
      hookId: transform({ context }, ({ context }) => context.hook.id),
      wiringEquipments: transform({ context }, ({ context }) => context.wiringEquipments),
    })

    createProductLinksStep(linkInputs)

    return new WorkflowResponse(createdProducts)
  },
)
